# Despliegue en Railway

## CI/CD (GitHub Actions)

- Workflow: `.github/workflows/ci-cd.yml`
- Trigger: push a `main`
- Jobs: tests (backend/frontend/backoffice) → deploy

### Secrets requeridos en GitHub

- `RAILWAY_TOKEN`: **Project Token** (Railway → Project → Settings → Tokens)
- `RAILWAY_PROJECT_ID`: opcional pero recomendado (Railway → Project → Settings → General)

Ver detalle en `source/CI-CD.md`.

## Root Directory (Railway)

En este repo, los servicios viven bajo `source/…`.

Si en Railway configuraste `Root Directory` como `/source/backend` (con slash inicial), asegúrate de que el CI suba el repo completo (desde la raíz), para que `source/` exista dentro del artefacto.

## Servicios

- **backend**: Dockerfile en `source/backend/Dockerfile`
- **frontend**: Dockerfile en `source/frontend/Dockerfile`
- **backoffice**: Dockerfile en `source/backoffice/Dockerfile`
- **Postgres**: servicio template

## Configuración crítica (backoffice/frontend)

En Railway, **no usar localhost** para hablar con el backend. Debe ser:

- `BACKEND_URL=http://backend.railway.internal:8090`

