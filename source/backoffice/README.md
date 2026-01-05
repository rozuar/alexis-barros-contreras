# Backoffice (Admin)

Panel administrativo para mantener la app: metadatos por obra, detalle, bitácora y estado “en progreso”.

## Requisitos

- Backend Go corriendo (por defecto `http://localhost:8090`)
- Variable de entorno `ADMIN_TOKEN` configurada en el backend

## Backend (seguridad)

Configura y levanta el backend:

```bash
export ADMIN_TOKEN="cambia-esto-por-un-token-largo"
cd ../backend
go run .
```

Los endpoints admin requieren header:

`Authorization: Bearer <ADMIN_TOKEN>`

## Levantar el backoffice

```bash
cd /home/rozuar/roz/dev-me/art/backoffice
npm install
BACKEND_URL=http://localhost:8090 npm run dev
```

Abre `http://localhost:3011`.

## Qué guarda el backoffice

En cada carpeta de obra (ej. `art/niña-lobos/`):

- `meta.json`:
  - `paintedLocation`
  - `startDate`
  - `endDate`
  - `inProgress`
- `detalle.txt`
- `bitacora.txt`


