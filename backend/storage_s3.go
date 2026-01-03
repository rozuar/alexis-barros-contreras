package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"path"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"alexis-art-backend/db"
)

type s3ArtworksStore struct {
	client        *s3.Client
	presignClient *s3.PresignClient
	bucket        string

	// If set, we do a plain public URL (no signing).
	// Expected format: https://host/path (no trailing slash required)
	publicBaseURL string

	// If publicBaseURL is empty, we presign for this TTL.
	presignTTL time.Duration
}

func envAny(keys ...string) string {
	for _, k := range keys {
		if v := strings.TrimSpace(os.Getenv(k)); v != "" {
			return v
		}
	}
	return ""
}

func newS3ArtworksStoreFromEnv() (*s3ArtworksStore, error) {
	// Bucket name - check Railway native vars first, then common alternatives
	bucket := envAny(
		"BUCKET_NAME",           // Railway Object Storage (via reference variable)
		"BUCKET",                // Railway Object Storage (direct)
		"ARTWORKS_BUCKET",       // Custom
		"OBJECT_STORAGE_BUCKET", // Generic
		"AWS_S3_BUCKET",         // AWS native
	)
	if bucket == "" {
		return nil, nil // S3 mode disabled
	}

	region := envAny("BUCKET_REGION", "REGION", "AWS_REGION", "S3_REGION", "OBJECT_STORAGE_REGION")
	if region == "" {
		region = "us-east-1"
	}
	// Some providers (e.g. Railway UI) show Region as "auto", but AWS SDK requires a real region string.
	if strings.EqualFold(region, "auto") {
		region = "us-east-1"
	}

	// Railway/Object Storage commonly exposes this.
	endpoint := envAny(
		"BUCKET_ENDPOINT",         // Railway Object Storage (via reference variable)
		"ENDPOINT",                // Railway Object Storage (direct)
		"AWS_ENDPOINT_URL_S3",     // AWS native
		"S3_ENDPOINT",             // Common
		"OBJECT_STORAGE_ENDPOINT", // Generic
	)

	accessKey := envAny("BUCKET_ACCESS_KEY_ID", "ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID", "S3_ACCESS_KEY_ID", "OBJECT_STORAGE_ACCESS_KEY_ID")
	secretKey := envAny("BUCKET_SECRET_ACCESS_KEY", "SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY", "S3_SECRET_ACCESS_KEY", "OBJECT_STORAGE_SECRET_ACCESS_KEY")

	publicBaseURL := strings.TrimRight(envAny("ARTWORKS_PUBLIC_BASE_URL", "PUBLIC_BUCKET_BASE_URL"), "/")

	ttlSeconds := 600
	if v := strings.TrimSpace(os.Getenv("ARTWORKS_PRESIGN_TTL_SECONDS")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			ttlSeconds = n
		}
	}

	var cfg aws.Config
	var err error
	if accessKey != "" && secretKey != "" {
		cfg, err = config.LoadDefaultConfig(
			context.Background(),
			config.WithRegion(region),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		)
	} else {
		cfg, err = config.LoadDefaultConfig(context.Background(), config.WithRegion(region))
	}
	if err != nil {
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		// For S3-compatible endpoints, path-style is typically the safest default.
		o.UsePathStyle = true
		if strings.TrimSpace(endpoint) != "" {
			o.BaseEndpoint = aws.String(strings.TrimRight(endpoint, "/"))
		}
	})

	return &s3ArtworksStore{
		client:        client,
		presignClient: s3.NewPresignClient(client),
		bucket:        bucket,
		publicBaseURL: publicBaseURL,
		presignTTL:    time.Duration(ttlSeconds) * time.Second,
	}, nil
}

func (s *s3ArtworksStore) publicURLForKey(key string) (string, bool) {
	if s.publicBaseURL == "" {
		return "", false
	}
	// Escape each segment so filenames with spaces/etc work.
	parts := strings.Split(key, "/")
	for i := range parts {
		parts[i] = url.PathEscape(parts[i])
	}
	return s.publicBaseURL + "/" + strings.Join(parts, "/"), true
}

func (s *s3ArtworksStore) presignedURL(ctx context.Context, key string) (string, error) {
	out, err := s.presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, func(po *s3.PresignOptions) {
		po.Expires = s.presignTTL
	})
	if err != nil {
		return "", err
	}
	return out.URL, nil
}

func (s *s3ArtworksStore) getObjectBytes(ctx context.Context, key string, maxBytes int64) ([]byte, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer out.Body.Close()

	var r io.Reader = out.Body
	if maxBytes > 0 {
		r = io.LimitReader(out.Body, maxBytes)
	}
	return io.ReadAll(r)
}

func (s *s3ArtworksStore) listArtworkIDs(ctx context.Context) ([]string, error) {
	var ids []string
	var token *string
	for {
		out, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket:            aws.String(s.bucket),
			Delimiter:         aws.String("/"),
			ContinuationToken: token,
		})
		if err != nil {
			return nil, err
		}
		for _, p := range out.CommonPrefixes {
			if p.Prefix == nil {
				continue
			}
			id := strings.TrimSuffix(*p.Prefix, "/")
			if id != "" {
				ids = append(ids, id)
			}
		}
		if aws.ToBool(out.IsTruncated) && out.NextContinuationToken != nil {
			token = out.NextContinuationToken
			continue
		}
		break
	}
	sort.Strings(ids)
	return ids, nil
}

func (s *s3ArtworksStore) scanArtwork(ctx context.Context, id string) (Artwork, error) {
	artwork := Artwork{
		ID:     id,
		Title:  formatTitle(id),
		Images: []string{},
		Videos: []string{},
	}

	prefix := id + "/"
	var token *string
	for {
		out, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
			Bucket:            aws.String(s.bucket),
			Prefix:            aws.String(prefix),
			ContinuationToken: token,
		})
		if err != nil {
			return artwork, err
		}
		for _, obj := range out.Contents {
			if obj.Key == nil {
				continue
			}
			key := *obj.Key
			if !strings.HasPrefix(key, prefix) {
				continue
			}
			rel := strings.TrimPrefix(key, prefix)
			if rel == "" || strings.Contains(rel, "/") {
				continue // ignore nested
			}
			ext := strings.ToLower(path.Ext(rel))
			base := strings.ToLower(strings.TrimSuffix(rel, ext))

			switch ext {
			case ".jpg", ".jpeg", ".png", ".gif":
				artwork.Images = append(artwork.Images, rel)
			case ".mp4", ".webm", ".mov":
				artwork.Videos = append(artwork.Videos, rel)
			case ".json":
				if base != "meta" {
					continue
				}
				b, err := s.getObjectBytes(ctx, key, 1<<20)
				if err != nil {
					continue
				}
				var m artworkMeta
				if err := json.Unmarshal(b, &m); err != nil {
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
				b, err := s.getObjectBytes(ctx, key, 1<<20)
				if err != nil {
					continue
				}
				if artwork.Bitacora == "" && strings.HasPrefix(base, "bitacora") {
					artwork.Bitacora = string(b)
					continue
				}
				if artwork.Detalle == "" && (strings.HasPrefix(base, "detalle") || strings.HasPrefix(base, "detail")) {
					artwork.Detalle = string(b)
					continue
				}
				if artwork.Bitacora == "" && artwork.Detalle == "" {
					artwork.Bitacora = string(b)
				}
			}
		}
		if aws.ToBool(out.IsTruncated) && out.NextContinuationToken != nil {
			token = out.NextContinuationToken
			continue
		}
		break
	}

	sort.Strings(artwork.Images)
	sort.Strings(artwork.Videos)

	// Overlay DB fields if enabled (same behavior as disk).
	if pgPool != nil {
		ctxDB, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		row, err := db.GetArtwork(ctxDB, pgPool, id)
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

func (s *s3ArtworksStore) scanArtworks(ctx context.Context) ([]Artwork, error) {
	ids, err := s.listArtworkIDs(ctx)
	if err != nil {
		return nil, err
	}
	var out []Artwork
	for _, id := range ids {
		a, err := s.scanArtwork(ctx, id)
		if err != nil {
			continue
		}
		if len(a.Images) > 0 || len(a.Videos) > 0 {
			out = append(out, a)
		}
	}
	return out, nil
}

func (s *s3ArtworksStore) keyFor(id, filename string) (string, error) {
	if !isSafeArtworkID(id) {
		return "", errors.New("invalid artwork id")
	}
	if filename == "" || strings.Contains(filename, "/") || strings.Contains(filename, "\\") || strings.Contains(filename, "..") {
		return "", errors.New("invalid filename")
	}
	return id + "/" + filename, nil
}

func (s *s3ArtworksStore) objectURL(ctx context.Context, id, filename string) (string, error) {
	key, err := s.keyFor(id, filename)
	if err != nil {
		return "", err
	}
	if u, ok := s.publicURLForKey(key); ok {
		return u, nil
	}
	return s.presignedURL(ctx, key)
}

func (s *s3ArtworksStore) putObject(ctx context.Context, key string, body io.Reader, contentType string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	return err
}

func (s *s3ArtworksStore) deleteObject(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	return err
}

func (s *s3ArtworksStore) ensureArtworkPrefixExists(ctx context.Context, id string) error {
	// S3 has no folders; we consider an artwork existing if any object exists under its prefix.
	prefix := id + "/"
	out, err := s.client.ListObjectsV2(ctx, &s3.ListObjectsV2Input{
		Bucket:  aws.String(s.bucket),
		Prefix:  aws.String(prefix),
		MaxKeys: aws.Int32(1),
	})
	if err != nil {
		return err
	}
	if len(out.Contents) == 0 {
		return fmt.Errorf("artwork not found")
	}
	return nil
}
