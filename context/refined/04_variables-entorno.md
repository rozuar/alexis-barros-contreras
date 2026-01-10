# Variables de entorno

## Backend (`source/backend`)

- `PORT`: puerto HTTP del backend (Railway lo inyecta; en local puedes usar 8090/8080)
- `ADMIN_TOKEN`: token Bearer requerido para `/api/v1/admin/*`
- `DATABASE_URL`: conexión Postgres

### Object Storage (S3-compatible)

- `ARTWORKS_BUCKET`: nombre del bucket
- `AWS_ENDPOINT_URL_S3`: endpoint (Railway Object Storage: `https://storage.railway.app`)
- `AWS_REGION`: región (si es `auto`, se normaliza a `us-east-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ARTWORKS_PUBLIC_BASE_URL` (opcional): si el bucket es público; si no, se usan URLs presignadas
- `ARTWORKS_PRESIGN_TTL_SECONDS` (opcional): default 600

## Frontend (`source/frontend`)

- `BACKEND_URL`: URL del backend para el proxy `/api/v1/*`
  - Local: `http://localhost:8090`
  - Railway: `http://backend.railway.internal:8090`

## Backoffice (`source/backoffice`)

- `BACKEND_URL`: igual que arriba (obligatorio en Railway)

## GitHub Actions (CI/CD)

- `RAILWAY_TOKEN`: Project Token (secret)
- `RAILWAY_PROJECT_ID`: opcional (secret)

