package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"alexis-art-backend/db"
)

const maxUploadSize = 10 << 20 // 10MB

type Artwork struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Images          []string `json:"images"`
	Videos          []string `json:"videos,omitempty"`
	Detalle         string   `json:"detalle,omitempty"`
	PaintedLocation string   `json:"paintedLocation,omitempty"`
	StartDate       string   `json:"startDate,omitempty"`
	EndDate         string   `json:"endDate,omitempty"`
	InProgress      bool     `json:"inProgress,omitempty"`
	Bitacora        string   `json:"bitacora,omitempty"`
	PrimaryImage    string   `json:"primaryImage,omitempty"`
}

type artworkMeta struct {
	PaintedLocation string `json:"paintedLocation"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	InProgress      bool   `json:"inProgress"`
}

type adminArtworkUpdate struct {
	Title           string `json:"title"`
	PaintedLocation string `json:"paintedLocation"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	InProgress      bool   `json:"inProgress"`
	Detalle         string `json:"detalle"`
	Bitacora        string `json:"bitacora"`
	PrimaryImage    string `json:"primaryImage"`
}

type adminArtworkCreate struct {
	Title string `json:"title"`
}

type ArtworkListResponse struct {
	Artworks []Artwork `json:"artworks"`
	Total    int       `json:"total"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var artworksDir string
var adminToken string
var pgPool *pgxpool.Pool
var s3Store *s3ArtworksStore

func main() {
	_ = godotenv.Load()

	// Get artworks directory from environment or use default
	artworksDir = os.Getenv("ARTWORKS_DIR")
	if artworksDir == "" {
		artworksDir = "../art"
	}

	adminToken = os.Getenv("ADMIN_TOKEN")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	// Optional S3-compatible Object Storage (Railway bucket, etc.)
	store, err := newS3ArtworksStoreFromEnv()
	if err != nil {
		log.Printf("Object storage init failed (continuing with disk): %v", err)
	} else {
		s3Store = store
		if s3Store != nil {
			log.Printf("Object storage enabled (bucket=%s)", s3Store.bucket)
		}
	}

	// Optional Postgres
	if databaseURL := os.Getenv("DATABASE_URL"); strings.TrimSpace(databaseURL) != "" {
		ctx := context.Background()
		pool, err := db.Connect(ctx, databaseURL)
		if err != nil {
			log.Printf("Postgres connect failed (continuing without DB): %v", err)
			pool = nil
		}
		if pool != nil {
			if err := db.Migrate(ctx, pool, "./db/migrations"); err != nil {
				log.Printf("Postgres migrate failed (continuing without DB): %v", err)
				pool.Close()
				pool = nil
			}
		}
		pgPool = pool
		if pgPool != nil {
			log.Printf("Postgres enabled")
		}
	}

	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/artworks", getArtworks).Methods("GET")
	api.HandleFunc("/artworks/{id}", getArtwork).Methods("GET")
	api.HandleFunc("/artworks/{id}/images/{filename}", serveImage).Methods("GET")
	api.HandleFunc("/artworks/{id}/videos/{filename}", serveVideo).Methods("GET")

	// Admin API (token required)
	admin := api.PathPrefix("/admin").Subrouter()
	admin.Use(adminAuthMiddleware)
	admin.HandleFunc("/artworks", adminListArtworks).Methods("GET")
	admin.HandleFunc("/artworks", adminCreateArtwork).Methods("POST")
	admin.HandleFunc("/artworks/{id}", adminGetArtwork).Methods("GET")
	admin.HandleFunc("/artworks/{id}", adminUpsertArtwork).Methods("PUT")
	admin.HandleFunc("/artworks/{id}/images", adminUploadImage).Methods("POST")
	admin.HandleFunc("/artworks/{id}/images/{filename}", adminDeleteImage).Methods("DELETE")
	admin.HandleFunc("/artworks/check-title", adminCheckTitle).Methods("GET")

	// Health check
	r.HandleFunc("/health", healthCheck).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // In production, specify exact origins
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	log.Printf("Server starting on port %s", port)
	log.Printf("Artworks directory: %s", artworksDir)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func getArtworks(w http.ResponseWriter, r *http.Request) {
	artworks, err := scanArtworks(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := ArtworkListResponse{
		Artworks: artworks,
		Total:    len(artworks),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getArtwork(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	artwork, err := getArtworkByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Artwork not found")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func serveImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	filename := vars["filename"]

	if s3Store != nil {
		u, err := s3Store.objectURL(r.Context(), id, filename)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid path")
			return
		}
		http.Redirect(w, r, u, http.StatusTemporaryRedirect)
		return
	}

	imagePath := filepath.Join(artworksDir, id, filename)

	// Security: ensure the path is within artworks directory
	if !strings.HasPrefix(imagePath, artworksDir) {
		respondWithError(w, http.StatusForbidden, "Invalid path")
		return
	}

	// Check if file exists
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		respondWithError(w, http.StatusNotFound, "Image not found")
		return
	}

	// Set appropriate content type
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	case ".gif":
		w.Header().Set("Content-Type", "image/gif")
	default:
		w.Header().Set("Content-Type", "application/octet-stream")
	}

	http.ServeFile(w, r, imagePath)
}

func serveVideo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	filename := vars["filename"]

	if s3Store != nil {
		u, err := s3Store.objectURL(r.Context(), id, filename)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, "Invalid path")
			return
		}
		http.Redirect(w, r, u, http.StatusTemporaryRedirect)
		return
	}

	videoPath := filepath.Join(artworksDir, id, filename)

	// Security: ensure the path is within artworks directory
	if !strings.HasPrefix(videoPath, artworksDir) {
		respondWithError(w, http.StatusForbidden, "Invalid path")
		return
	}

	// Check if file exists
	if _, err := os.Stat(videoPath); os.IsNotExist(err) {
		respondWithError(w, http.StatusNotFound, "Video not found")
		return
	}

	w.Header().Set("Content-Type", "video/mp4")
	http.ServeFile(w, r, videoPath)
}

func scanArtworks(ctx context.Context) ([]Artwork, error) {
	if s3Store != nil {
		return s3Store.scanArtworks(ctx)
	}
	var artworks []Artwork

	entries, err := os.ReadDir(artworksDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read artworks directory: %v", err)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		artworkID := entry.Name()
		artworkPath := filepath.Join(artworksDir, artworkID)

		artwork, err := scanArtworkDirectory(artworkID, artworkPath)
		if err != nil {
			log.Printf("Error scanning artwork %s: %v", artworkID, err)
			continue
		}

		if len(artwork.Images) > 0 || len(artwork.Videos) > 0 {
			artworks = append(artworks, artwork)
		}
	}

	return artworks, nil
}

func scanArtworkDirectory(id, path string) (Artwork, error) {
	artwork := Artwork{
		ID:     id,
		Title:  formatTitle(id),
		Images: []string{},
		Videos: []string{},
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		return artwork, err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		filename := entry.Name()
		ext := strings.ToLower(filepath.Ext(filename))
		base := strings.ToLower(strings.TrimSuffix(filename, ext))

		switch ext {
		case ".jpg", ".jpeg", ".png", ".gif":
			artwork.Images = append(artwork.Images, filename)
		case ".mp4", ".webm", ".mov":
			artwork.Videos = append(artwork.Videos, filename)
		case ".json":
			// Optional per-artwork metadata file: meta.json
			if base != "meta" {
				continue
			}
			contentPath := filepath.Join(path, filename)
			content, err := os.ReadFile(contentPath)
			if err != nil {
				continue
			}
			var m artworkMeta
			if err := json.Unmarshal(content, &m); err != nil {
				continue
			}
			if artwork.PaintedLocation == "" {
				artwork.PaintedLocation = strings.TrimSpace(m.PaintedLocation)
			}
			if artwork.StartDate == "" {
				artwork.StartDate = strings.TrimSpace(m.StartDate)
			}
			if artwork.EndDate == "" {
				artwork.EndDate = strings.TrimSpace(m.EndDate)
			}
			artwork.InProgress = m.InProgress
		case ".txt", ".md":
			// Read text content:
			// - Prefer explicit names: bitacora.* and detalle/detail.*
			// - Backwards compatible fallback: first *.txt/*.md becomes bitacora
			contentPath := filepath.Join(path, filename)
			content, err := os.ReadFile(contentPath)
			if err != nil {
				continue
			}
			if artwork.Bitacora == "" && strings.HasPrefix(base, "bitacora") {
				artwork.Bitacora = string(content)
				continue
			}
			if artwork.Detalle == "" && (strings.HasPrefix(base, "detalle") || strings.HasPrefix(base, "detail")) {
				artwork.Detalle = string(content)
				continue
			}
			if artwork.Bitacora == "" && artwork.Detalle == "" {
				artwork.Bitacora = string(content)
			}
		}
	}

	// Stable ordering so "Referencia" uses a predictable first image.
	sort.Strings(artwork.Images)
	sort.Strings(artwork.Videos)

	// If Postgres is enabled, overlay editable fields from DB.
	if pgPool != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		row, err := db.GetArtwork(ctx, pgPool, id)
		if err == nil && row != nil {
			if row.Title != "" {
				artwork.Title = row.Title
			}
			artwork.PaintedLocation = row.PaintedLocation
			if row.StartDate != nil {
				artwork.StartDate = row.StartDate.Format("2006-01-02")
			}
			if row.EndDate != nil {
				artwork.EndDate = row.EndDate.Format("2006-01-02")
			}
			artwork.InProgress = row.InProgress
			if row.Detalle != "" {
				artwork.Detalle = row.Detalle
			}
			if row.Bitacora != "" {
				artwork.Bitacora = row.Bitacora
			}
			if row.PrimaryImage != "" {
				artwork.PrimaryImage = row.PrimaryImage
			}
		}
	}

	// Default primary image to first image if not set
	if artwork.PrimaryImage == "" && len(artwork.Images) > 0 {
		artwork.PrimaryImage = artwork.Images[0]
	}

	return artwork, nil
}

func adminAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if adminToken == "" {
			respondWithError(w, http.StatusInternalServerError, "ADMIN_TOKEN is not configured")
			return
		}
		auth := r.Header.Get("Authorization")
		const prefix = "Bearer "
		if !strings.HasPrefix(auth, prefix) || strings.TrimSpace(strings.TrimPrefix(auth, prefix)) != adminToken {
			respondWithError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isSafeArtworkID(id string) bool {
	if id == "" {
		return false
	}
	if strings.Contains(id, "/") || strings.Contains(id, "\\") || strings.Contains(id, "..") {
		return false
	}
	return true
}

func adminListArtworks(w http.ResponseWriter, r *http.Request) {
	artworks, err := scanArtworks(r.Context())
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Sort by start_date DESC (nulls last), then by title ASC
	sort.Slice(artworks, func(i, j int) bool {
		// Both have dates
		if artworks[i].StartDate != "" && artworks[j].StartDate != "" {
			return artworks[i].StartDate > artworks[j].StartDate // DESC
		}
		// Only i has date - i comes first
		if artworks[i].StartDate != "" && artworks[j].StartDate == "" {
			return true
		}
		// Only j has date - j comes first
		if artworks[i].StartDate == "" && artworks[j].StartDate != "" {
			return false
		}
		// Neither has date - sort by title ASC
		return strings.ToLower(artworks[i].Title) < strings.ToLower(artworks[j].Title)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ArtworkListResponse{Artworks: artworks, Total: len(artworks)})
}

func generateArtworkID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func adminCreateArtwork(w http.ResponseWriter, r *http.Request) {
	if pgPool == nil {
		respondWithError(w, http.StatusInternalServerError, "Database not configured")
		return
	}

	var payload adminArtworkCreate
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	title := strings.TrimSpace(payload.Title)
	if title == "" {
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	// Check title uniqueness
	unique, err := db.IsTitleUnique(ctx, pgPool, title, "")
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check title uniqueness")
		return
	}
	if !unique {
		respondWithError(w, http.StatusConflict, "Title already exists")
		return
	}

	// Generate unique ID
	id := generateArtworkID()

	// Create folder in S3 or disk
	if s3Store != nil {
		// Create a placeholder file to establish the prefix
		key := id + "/.placeholder"
		if err := s3Store.putObject(ctx, key, strings.NewReader(""), "text/plain"); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create artwork folder")
			return
		}
	} else {
		artworkPath := filepath.Join(artworksDir, id)
		if err := os.MkdirAll(artworkPath, 0755); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create artwork folder")
			return
		}
	}

	// Save to database
	err = db.UpsertArtwork(ctx, pgPool, db.ArtworkRow{
		ID:    id,
		Title: title,
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to save artwork")
		return
	}

	artwork := Artwork{
		ID:     id,
		Title:  title,
		Images: []string{},
		Videos: []string{},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(artwork)
}

func adminCheckTitle(w http.ResponseWriter, r *http.Request) {
	if pgPool == nil {
		respondWithError(w, http.StatusInternalServerError, "Database not configured")
		return
	}

	title := strings.TrimSpace(r.URL.Query().Get("title"))
	excludeID := strings.TrimSpace(r.URL.Query().Get("excludeId"))

	if title == "" {
		respondWithError(w, http.StatusBadRequest, "Title parameter is required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	unique, err := db.IsTitleUnique(ctx, pgPool, title, excludeID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to check title")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"available": unique})
}

func adminGetArtwork(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if !isSafeArtworkID(id) {
		respondWithError(w, http.StatusBadRequest, "Invalid artwork id")
		return
	}
	artwork, err := getArtworkByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusNotFound, "Artwork not found")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(artwork)
}

func adminUpsertArtwork(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if !isSafeArtworkID(id) {
		respondWithError(w, http.StatusBadRequest, "Invalid artwork id")
		return
	}

	artworkPath := filepath.Join(artworksDir, id)
	if s3Store != nil {
		if err := s3Store.ensureArtworkPrefixExists(r.Context(), id); err != nil {
			respondWithError(w, http.StatusNotFound, "Artwork not found")
			return
		}
	} else {
		if _, err := os.Stat(artworkPath); os.IsNotExist(err) {
			respondWithError(w, http.StatusNotFound, "Artwork not found")
			return
		}
	}

	var payload adminArtworkUpdate
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	meta := artworkMeta{
		PaintedLocation: strings.TrimSpace(payload.PaintedLocation),
		StartDate:       strings.TrimSpace(payload.StartDate),
		EndDate:         strings.TrimSpace(payload.EndDate),
		InProgress:      payload.InProgress,
	}
	metaBytes, _ := json.MarshalIndent(meta, "", "  ")
	if s3Store != nil {
		key := id + "/meta.json"
		if err := s3Store.putObject(r.Context(), key, strings.NewReader(string(append(metaBytes, '\n'))), "application/json"); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write meta.json")
			return
		}
	} else {
		if err := os.WriteFile(filepath.Join(artworkPath, "meta.json"), append(metaBytes, '\n'), 0644); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write meta.json")
			return
		}
	}

	if s3Store != nil {
		key := id + "/detalle.txt"
		if strings.TrimSpace(payload.Detalle) == "" {
			_ = s3Store.deleteObject(r.Context(), key)
		} else {
			if err := s3Store.putObject(r.Context(), key, strings.NewReader(payload.Detalle), "text/plain; charset=utf-8"); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to write detalle.txt")
				return
			}
		}
	} else {
		if strings.TrimSpace(payload.Detalle) == "" {
			_ = os.Remove(filepath.Join(artworkPath, "detalle.txt"))
		} else {
			if err := os.WriteFile(filepath.Join(artworkPath, "detalle.txt"), []byte(payload.Detalle), 0644); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to write detalle.txt")
				return
			}
		}
	}

	if s3Store != nil {
		key := id + "/bitacora.txt"
		if strings.TrimSpace(payload.Bitacora) == "" {
			_ = s3Store.deleteObject(r.Context(), key)
		} else {
			if err := s3Store.putObject(r.Context(), key, strings.NewReader(payload.Bitacora), "text/plain; charset=utf-8"); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to write bitacora.txt")
				return
			}
		}
	} else {
		if strings.TrimSpace(payload.Bitacora) == "" {
			_ = os.Remove(filepath.Join(artworkPath, "bitacora.txt"))
		} else {
			if err := os.WriteFile(filepath.Join(artworkPath, "bitacora.txt"), []byte(payload.Bitacora), 0644); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to write bitacora.txt")
				return
			}
		}
	}

	// Persist to Postgres (required for title/primaryImage)
	if pgPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		// Validate title uniqueness if provided
		title := strings.TrimSpace(payload.Title)
		if title != "" {
			unique, err := db.IsTitleUnique(ctx, pgPool, title, id)
			if err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to check title uniqueness")
				return
			}
			if !unique {
				respondWithError(w, http.StatusConflict, "Title already exists")
				return
			}
		}

		var sd *time.Time
		var ed *time.Time
		if strings.TrimSpace(payload.StartDate) != "" {
			if t, err := time.Parse("2006-01-02", strings.TrimSpace(payload.StartDate)); err == nil {
				sd = &t
			}
		}
		if strings.TrimSpace(payload.EndDate) != "" {
			if t, err := time.Parse("2006-01-02", strings.TrimSpace(payload.EndDate)); err == nil {
				ed = &t
			}
		}
		_ = db.UpsertArtwork(ctx, pgPool, db.ArtworkRow{
			ID:              id,
			Title:           title,
			PaintedLocation: strings.TrimSpace(payload.PaintedLocation),
			StartDate:       sd,
			EndDate:         ed,
			InProgress:      payload.InProgress,
			Detalle:         payload.Detalle,
			Bitacora:        payload.Bitacora,
			PrimaryImage:    strings.TrimSpace(payload.PrimaryImage),
		})
	}

	updated, err := getArtworkByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to re-read artwork")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func getArtworkByID(ctx context.Context, id string) (Artwork, error) {
	if s3Store != nil {
		return s3Store.scanArtwork(ctx, id)
	}
	artworkPath := filepath.Join(artworksDir, id)

	if _, err := os.Stat(artworkPath); os.IsNotExist(err) {
		return Artwork{}, fmt.Errorf("artwork not found")
	}

	return scanArtworkDirectory(id, artworkPath)
}

func formatTitle(id string) string {
	words := strings.Split(id, "-")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + word[1:]
		}
	}
	return strings.Join(words, " ")
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}

func adminUploadImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if !isSafeArtworkID(id) {
		respondWithError(w, http.StatusBadRequest, "Invalid artwork id")
		return
	}

	artworkPath := filepath.Join(artworksDir, id)
	if s3Store != nil {
		if err := s3Store.ensureArtworkPrefixExists(r.Context(), id); err != nil {
			respondWithError(w, http.StatusNotFound, "Artwork not found")
			return
		}
	} else {
		if _, err := os.Stat(artworkPath); os.IsNotExist(err) {
			respondWithError(w, http.StatusNotFound, "Artwork not found")
			return
		}
	}

	// Limit upload size
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		respondWithError(w, http.StatusBadRequest, "File too large (max 10MB)")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "No image file provided")
		return
	}
	defer file.Close()

	// Validate content type
	contentType := header.Header.Get("Content-Type")
	if !isValidImageType(contentType) {
		respondWithError(w, http.StatusBadRequest, "Invalid file type. Allowed: JPEG, PNG, GIF")
		return
	}

	// Generate safe filename
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		ext = getExtensionFromMime(contentType)
	}
	safeFilename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), sanitizeFilename(header.Filename), ext)

	if s3Store != nil {
		key := id + "/" + safeFilename
		if err := s3Store.putObject(r.Context(), key, file, contentType); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to save image")
			return
		}
	} else {
		// Save file to disk
		destPath := filepath.Join(artworkPath, safeFilename)
		destFile, err := os.Create(destPath)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to save image")
			return
		}
		defer destFile.Close()

		if _, err := io.Copy(destFile, file); err != nil {
			os.Remove(destPath)
			respondWithError(w, http.StatusInternalServerError, "Failed to save image")
			return
		}
	}

	// Return updated artwork
	updated, err := getArtworkByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to re-read artwork")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func adminDeleteImage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	filename := vars["filename"]

	if !isSafeArtworkID(id) {
		respondWithError(w, http.StatusBadRequest, "Invalid artwork id")
		return
	}

	// Validate filename (no path traversal)
	if strings.Contains(filename, "/") || strings.Contains(filename, "\\") || strings.Contains(filename, "..") {
		respondWithError(w, http.StatusBadRequest, "Invalid filename")
		return
	}

	artworkPath := filepath.Join(artworksDir, id)
	imagePath := filepath.Join(artworkPath, filename)

	if s3Store == nil {
		// Security check
		absArtworks, _ := filepath.Abs(artworksDir)
		absImage, _ := filepath.Abs(imagePath)
		if !strings.HasPrefix(absImage, absArtworks) {
			respondWithError(w, http.StatusForbidden, "Invalid path")
			return
		}

		// Check if file exists
		if _, err := os.Stat(imagePath); os.IsNotExist(err) {
			respondWithError(w, http.StatusNotFound, "Image not found")
			return
		}
	}

	// Check query param: deleteFile=true to actually delete from disk
	deleteFromDisk := r.URL.Query().Get("deleteFile") == "true"

	if deleteFromDisk {
		if s3Store != nil {
			key := id + "/" + filename
			if err := s3Store.deleteObject(r.Context(), key); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to delete image")
				return
			}
		} else {
			if err := os.Remove(imagePath); err != nil {
				respondWithError(w, http.StatusInternalServerError, "Failed to delete image")
				return
			}
		}
	}

	// Return updated artwork
	updated, err := getArtworkByID(r.Context(), id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to re-read artwork")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func isValidImageType(contentType string) bool {
	validTypes := []string{"image/jpeg", "image/png", "image/gif"}
	for _, t := range validTypes {
		if strings.HasPrefix(contentType, t) {
			return true
		}
	}
	return false
}

func getExtensionFromMime(contentType string) string {
	switch {
	case strings.HasPrefix(contentType, "image/jpeg"):
		return ".jpg"
	case strings.HasPrefix(contentType, "image/png"):
		return ".png"
	case strings.HasPrefix(contentType, "image/gif"):
		return ".gif"
	default:
		return ".jpg"
	}
}

func sanitizeFilename(filename string) string {
	// Remove extension and path
	base := filepath.Base(filename)
	ext := filepath.Ext(base)
	name := strings.TrimSuffix(base, ext)

	// Keep only alphanumeric and hyphens
	var result strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			result.WriteRune(r)
		}
	}

	s := result.String()
	if len(s) > 50 {
		s = s[:50]
	}
	if s == "" {
		s = "image"
	}
	return s
}
