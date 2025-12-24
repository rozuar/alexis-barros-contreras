FROM golang:1.23-alpine AS backend-builder
WORKDIR /app/backend
RUN apk add --no-cache ca-certificates git
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/backend ./.

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Backend binary
COPY --from=backend-builder /out/backend /app/backend

# Next standalone output
COPY --from=frontend-builder /app/frontend/.next/standalone /app/
COPY --from=frontend-builder /app/frontend/.next/static /app/.next/static
COPY --from=frontend-builder /app/frontend/public /app/public

# Artwork media (filesystem-backed)
COPY art /app/art

COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]


