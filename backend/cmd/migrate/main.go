package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	if len(os.Args) < 2 {
		fmt.Println("Usage: migrate <source-directory>")
		fmt.Println("Example: migrate /home/roz/Pictures/art")
		fmt.Println()
		fmt.Println("Required environment variables:")
		fmt.Println("  BUCKET_NAME or BUCKET - S3 bucket name")
		fmt.Println("  BUCKET_ENDPOINT or ENDPOINT - S3 endpoint URL")
		fmt.Println("  ACCESS_KEY_ID - S3 access key")
		fmt.Println("  SECRET_ACCESS_KEY - S3 secret key")
		os.Exit(1)
	}

	sourceDir := os.Args[1]

	// Check source directory
	info, err := os.Stat(sourceDir)
	if err != nil || !info.IsDir() {
		log.Fatalf("Source directory does not exist: %s", sourceDir)
	}

	// Get S3 config from environment
	bucket := envAny("BUCKET_NAME", "BUCKET", "ARTWORKS_BUCKET")
	endpoint := envAny("BUCKET_ENDPOINT", "ENDPOINT", "S3_ENDPOINT")
	accessKey := envAny("BUCKET_ACCESS_KEY_ID", "ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID")
	secretKey := envAny("BUCKET_SECRET_ACCESS_KEY", "SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY")
	region := envAny("BUCKET_REGION", "REGION", "AWS_REGION")

	if bucket == "" {
		log.Fatal("BUCKET_NAME or BUCKET environment variable is required")
	}
	if endpoint == "" {
		log.Fatal("BUCKET_ENDPOINT or ENDPOINT environment variable is required")
	}
	if accessKey == "" || secretKey == "" {
		log.Fatal("ACCESS_KEY_ID and SECRET_ACCESS_KEY are required")
	}
	if region == "" || strings.EqualFold(region, "auto") {
		region = "us-east-1"
	}

	// Create S3 client
	cfg, err := config.LoadDefaultConfig(
		context.Background(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS config: %v", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(strings.TrimRight(endpoint, "/"))
	})

	fmt.Printf("Migrating from: %s\n", sourceDir)
	fmt.Printf("To bucket: %s (endpoint: %s)\n", bucket, endpoint)
	fmt.Println()

	// Walk through source directory
	var totalFiles, uploadedFiles, skippedFiles int

	entries, err := os.ReadDir(sourceDir)
	if err != nil {
		log.Fatalf("Failed to read source directory: %v", err)
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		artworkID := entry.Name()
		artworkPath := filepath.Join(sourceDir, artworkID)

		fmt.Printf("Processing artwork: %s\n", artworkID)

		files, err := os.ReadDir(artworkPath)
		if err != nil {
			log.Printf("  Error reading artwork directory: %v", err)
			continue
		}

		for _, file := range files {
			if file.IsDir() {
				continue
			}

			filename := file.Name()
			totalFiles++

			// Check if already exists in bucket
			key := artworkID + "/" + filename
			exists, err := objectExists(context.Background(), client, bucket, key)
			if err != nil {
				log.Printf("  Error checking %s: %v", filename, err)
				continue
			}

			if exists {
				fmt.Printf("  [SKIP] %s (already exists)\n", filename)
				skippedFiles++
				continue
			}

			// Upload file
			filePath := filepath.Join(artworkPath, filename)
			contentType := getContentType(filename)

			if err := uploadFile(context.Background(), client, bucket, key, filePath, contentType); err != nil {
				log.Printf("  [ERROR] %s: %v", filename, err)
				continue
			}

			fmt.Printf("  [OK] %s\n", filename)
			uploadedFiles++
		}
	}

	fmt.Println()
	fmt.Printf("Migration complete!\n")
	fmt.Printf("  Total files: %d\n", totalFiles)
	fmt.Printf("  Uploaded: %d\n", uploadedFiles)
	fmt.Printf("  Skipped: %d\n", skippedFiles)
}

func envAny(keys ...string) string {
	for _, k := range keys {
		if v := strings.TrimSpace(os.Getenv(k)); v != "" {
			return v
		}
	}
	return ""
}

func objectExists(ctx context.Context, client *s3.Client, bucket, key string) (bool, error) {
	_, err := client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		// Check if it's a "not found" error
		if strings.Contains(err.Error(), "NotFound") || strings.Contains(err.Error(), "404") {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func uploadFile(ctx context.Context, client *s3.Client, bucket, key, filePath, contentType string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})
	return err
}

func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".mp4":
		return "video/mp4"
	case ".webm":
		return "video/webm"
	case ".mov":
		return "video/quicktime"
	case ".json":
		return "application/json"
	case ".txt":
		return "text/plain; charset=utf-8"
	case ".md":
		return "text/markdown; charset=utf-8"
	default:
		return "application/octet-stream"
	}
}
