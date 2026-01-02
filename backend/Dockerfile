FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache ca-certificates git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/backend .

# Production image
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Copy binary
COPY --from=builder /out/backend /app/backend

# Copy art folder as source for migration (Railway Volume will be at /app/art)
COPY --from=builder /app/art /app/art-source

# Copy migration script
COPY scripts/migrate.sh /app/migrate.sh
RUN chmod +x /app/migrate.sh

EXPOSE 8090

ENV PORT=8090
ENV ARTWORKS_DIR=/app/art

# Use migration script as entrypoint (migrates on first run, then starts backend)
CMD ["/app/migrate.sh"]
