# Troubleshooting

## Backoffice muestra 500

**Síntoma**: error 500 al cargar páginas o al llamar `/api/v1/...` desde backoffice.

**Causa típica**: `BACKEND_URL` no está configurado en Railway y el proxy intenta `http://localhost:8090`.

**Solución**:
- En el servicio `backoffice` (Railway): `BACKEND_URL=http://backend.railway.internal:8090`
- Repetir en `frontend` si también usa proxy.

## “Could not find root directory: /source/<service>”

**Causa**: el artefacto subido por `railway up` no contiene `source/…` pero Railway está configurado con `Root Directory=/source/...`.

**Solución**:
- Desplegar desde la raíz del repo (para incluir `source/`)
- O ajustar `Root Directory` en Railway para que coincida con lo que subes

## Railway CLI: “Project Token not found”

**Causa**: `RAILWAY_TOKEN` no es un Project Token válido (o el repo no está linkeado).

**Solución**:
- Usar Project Token (Railway → Project → Settings → Tokens)
- Opcional: setear `RAILWAY_PROJECT_ID` (GitHub secret) y ejecutar `railway link -p ...` en CI

