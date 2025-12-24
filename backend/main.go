package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"

	"alexis-art-backend/db"
)

type Artwork struct {
	ID       string   `json:"id"`
	Title    string   `json:"title"`
	Images   []string `json:"images"`
	Videos   []string `json:"videos,omitempty"`
	Detalle  string   `json:"detalle,omitempty"`
	PaintedLocation string `json:"paintedLocation,omitempty"`
	StartDate       string `json:"startDate,omitempty"`
	EndDate         string `json:"endDate,omitempty"`
	InProgress      bool   `json:"inProgress,omitempty"`
	Bitacora string   `json:"bitacora,omitempty"`
}

type artworkMeta struct {
	PaintedLocation string `json:"paintedLocation"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	InProgress      bool   `json:"inProgress"`
}

type adminArtworkUpdate struct {
	PaintedLocation string `json:"paintedLocation"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	InProgress      bool   `json:"inProgress"`
	Detalle         string `json:"detalle"`
	Bitacora        string `json:"bitacora"`
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
	admin.HandleFunc("/artworks/{id}", adminGetArtwork).Methods("GET")
	admin.HandleFunc("/artworks/{id}", adminUpsertArtwork).Methods("PUT")

	// Health check
	r.HandleFunc("/health", healthCheck).Methods("GET")

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // In production, specify exact origins
		AllowedMethods: []string{"GET", "PUT", "OPTIONS"},
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
	artworks, err := scanArtworks()
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

	artwork, err := getArtworkByID(id)
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

func scanArtworks() ([]Artwork, error) {
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
		}
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
	artworks, err := scanArtworks()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ArtworkListResponse{Artworks: artworks, Total: len(artworks)})
}

func adminGetArtwork(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	if !isSafeArtworkID(id) {
		respondWithError(w, http.StatusBadRequest, "Invalid artwork id")
		return
	}
	artwork, err := getArtworkByID(id)
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
	if _, err := os.Stat(artworkPath); os.IsNotExist(err) {
		respondWithError(w, http.StatusNotFound, "Artwork not found")
		return
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
	if err := os.WriteFile(filepath.Join(artworkPath, "meta.json"), append(metaBytes, '\n'), 0644); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to write meta.json")
		return
	}

	if strings.TrimSpace(payload.Detalle) == "" {
		_ = os.Remove(filepath.Join(artworkPath, "detalle.txt"))
	} else {
		if err := os.WriteFile(filepath.Join(artworkPath, "detalle.txt"), []byte(payload.Detalle), 0644); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write detalle.txt")
			return
		}
	}

	if strings.TrimSpace(payload.Bitacora) == "" {
		_ = os.Remove(filepath.Join(artworkPath, "bitacora.txt"))
	} else {
		if err := os.WriteFile(filepath.Join(artworkPath, "bitacora.txt"), []byte(payload.Bitacora), 0644); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to write bitacora.txt")
			return
		}
	}

	// Persist to Postgres (optional)
	if pgPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
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
			Title:           "", // keep computed title unless you want to manage it
			PaintedLocation: strings.TrimSpace(payload.PaintedLocation),
			StartDate:       sd,
			EndDate:         ed,
			InProgress:      payload.InProgress,
			Detalle:         payload.Detalle,
			Bitacora:        payload.Bitacora,
		})
	}

	updated, err := getArtworkByID(id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to re-read artwork")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func getArtworkByID(id string) (Artwork, error) {
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

