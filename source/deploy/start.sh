#!/usr/bin/env sh
set -e

# Railway provides $PORT for the public web server. We'll run:
# - Go backend on 8090 (internal)
# - Next server (standalone) on $PORT (public)

BACKEND_PORT="${BACKEND_PORT:-8090}"
WEB_PORT="${PORT:-3000}"

export BACKEND_URL="http://127.0.0.1:${BACKEND_PORT}"
export ARTWORKS_DIR="${ARTWORKS_DIR:-/app/art}"

echo "Starting backend on :${BACKEND_PORT} ..."
PORT="${BACKEND_PORT}" /app/backend &

echo "Starting web on :${WEB_PORT} (proxy -> ${BACKEND_URL}) ..."
PORT="${WEB_PORT}" node /app/server.js


