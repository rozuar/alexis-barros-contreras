# Estructura de carpetas

Basado en `context/raw/carpetas.txt`, pero alineado con el repo actual (todo el código vive en `source/`).

## Estructura real del repo

```
alexis-barros-contreras/
├── source/
│   ├── backend/           # Go API
│   ├── frontend/          # Next.js (público)
│   ├── backoffice/        # Next.js (admin)
│   ├── mobile/            # React Native
│   ├── deploy/            # scripts/containers auxiliares (si aplica)
│   ├── docker-compose.yml # Postgres local
│   └── CI-CD.md           # doc de CI/CD
├── context/
│   ├── raw/               # notas rápidas
│   └── refined/           # documentación ordenada (esta carpeta)
├── .github/workflows/     # CI/CD (GitHub Actions)
├── MANUAL_BACKOFFICE.md   # guía de uso del backoffice
└── README.md              # overview del proyecto
```

## Nota sobre “arte” / assets

Las imágenes/videos **no** deberían vivir en git en producción.

- Local/dev: pueden existir en disco para pruebas.
- Producción: se recomienda **Object Storage (S3-compatible)** y servirlas vía backend.

