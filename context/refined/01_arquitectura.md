# Visión general de arquitectura

Basado en `context/raw/arquitectura.txt`, pero actualizado a la estructura real del proyecto.

## Componentes

- **Backend (Go)** (`source/backend/`)
  - API REST (`/api/v1/...`) y endpoints admin (`/api/v1/admin/...`)
  - Persistencia: **Postgres** (para metadatos editables como título, detalle y bitácora)
  - Multimedia (imágenes/videos): **Object Storage S3-compatible** (Railway bucket) cuando se configura; fallback a filesystem en local si aplica

- **Frontend público (Next.js)** (`source/frontend/`)
  - Web pública para mostrar catálogo/portfolio
  - Consume la API vía rutas relativas `/api/v1/...` (proxy del propio Next)

- **Backoffice (Next.js)** (`source/backoffice/`)
  - Panel administrativo para CRUD de obras, subida/borrado de imágenes y edición de textos
  - También consume `/api/v1/...` vía proxy del propio Next (requiere `BACKEND_URL` en Railway)

- **Mobile (React Native)** (`source/mobile/`)
  - App móvil para iOS/Android consumiendo el backend

## Comunicación entre componentes

- **Frontend/Backoffice → Backend**:
  - En local: `BACKEND_URL=http://localhost:8090` (proxy Next) y el backend escucha en `PORT`
  - En Railway: `BACKEND_URL=http://backend.railway.internal:8090` (no usar `localhost`)

## Capa de datos

- **Postgres**: entidad “Artwork” editable (título, estado, detalle, bitácora, fechas, etc.)
- **Object Storage** (S3-compatible): imágenes/videos organizados por prefijo:
  - `<artwork-id>/<archivo>`
  - Ejemplo: `cisne/CZEvBMILM8w_2.jpg`

## Infraestructura portable

- Hoy: Railway (CI/CD desde GitHub Actions)
- Objetivo: mantener configuración portable (Dockerfiles por servicio, env vars) para poder migrar a otros proveedores (p.ej. GCP).

