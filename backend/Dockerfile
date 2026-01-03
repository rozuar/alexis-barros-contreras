FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache ca-certificates git

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Ensure art directory exists even if it is not tracked in git (bucket mode)
RUN mkdir -p /app/art

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/backend .

# Production image
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Copy binary
COPY --from=builder /out/backend /app/backend

EXPOSE 8090

ENV PORT=8090

# Images are stored in Railway Object Storage (bucket)
# No local art folder needed when using S3 mode
CMD ["/app/backend"]
