FROM golang:1.23-alpine AS backend_builder

WORKDIR /src/backend
RUN apk add --no-cache ca-certificates git
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/backend .


FROM node:20-alpine AS frontend_deps
WORKDIR /src/frontend
RUN apk add --no-cache libc6-compat
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci


FROM node:20-alpine AS frontend_builder
WORKDIR /src/frontend
COPY --from=frontend_deps /src/frontend/node_modules ./node_modules
COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Backend binary + art
COPY --from=backend_builder /out/backend /app/backend
COPY --from=backend_builder /src/backend/art /app/art

# Frontend standalone output (includes server.js)
COPY --from=frontend_builder /src/frontend/public /app/public
COPY --from=frontend_builder /src/frontend/.next/standalone /app/
COPY --from=frontend_builder /src/frontend/.next/static /app/.next/static

# Entrypoint
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]


