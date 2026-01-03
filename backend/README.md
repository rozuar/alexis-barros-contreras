# Backend - Alexis Art API

API REST en Go para servir las obras de arte, imágenes, videos y bitácoras.

## Características

- API REST con endpoints para listar y obtener obras
- Servicio de archivos estáticos (imágenes y videos)
- Soporte CORS para frontend y mobile
- Escaneo automático de carpetas de obras
- Soporte para bitácoras (archivos .txt o .md)

## Endpoints

### GET /api/v1/artworks
Lista todas las obras disponibles.

**Response:**
```json
{
  "artworks": [
    {
      "id": "a-la-espera",
      "title": "A La Espera",
      "images": ["image1.jpg", "image2.jpg"],
      "videos": ["video1.mp4"],
      "bitacora": "Texto de la bitácora..."
    }
  ],
  "total": 46
}
```

### GET /api/v1/artworks/{id}
Obtiene los detalles de una obra específica.

**Response:**
```json
{
  "id": "a-la-espera",
  "title": "A La Espera",
  "images": ["image1.jpg", "image2.jpg"],
  "videos": ["video1.mp4"],
  "bitacora": "Texto de la bitácora..."
}
```

### GET /api/v1/artworks/{id}/images/{filename}
Sirve una imagen específica de una obra.

### GET /api/v1/artworks/{id}/videos/{filename}
Sirve un video específico de una obra.

### GET /health
Health check endpoint.

## Configuración

### Variables de entorno

- `PORT`: Puerto del servidor (default: 8080)
- `ARTWORKS_DIR`: Directorio donde están las obras (default: ../art)
- `ARTWORKS_BUCKET`: **Si se define**, el backend usa Object Storage S3-compatible para leer/subir/borrar archivos (en vez de `ARTWORKS_DIR`).
- `AWS_ACCESS_KEY_ID`: Access key del bucket (S3-compatible)
- `AWS_SECRET_ACCESS_KEY`: Secret key del bucket (S3-compatible)
- `AWS_REGION`: Región (default: `us-east-1`)
- `AWS_REGION=auto`: el backend lo normaliza a `us-east-1` (compatibilidad con UIs que muestran "auto").
- `AWS_ENDPOINT_URL_S3`: Endpoint S3-compatible (Railway Object Storage suele entregar uno). Alternativas soportadas: `S3_ENDPOINT`, `OBJECT_STORAGE_ENDPOINT`.
- `ARTWORKS_PUBLIC_BASE_URL`: (opcional) Base URL pública del bucket para servir assets sin firmar. Si no se define, el backend usa URLs **presignadas**.
- `ARTWORKS_PRESIGN_TTL_SECONDS`: (opcional) TTL de la URL presignada en segundos (default: 600).
- `ADMIN_TOKEN`: Token para endpoints de administración (obligatorio para /api/v1/admin/*)
- `DATABASE_URL`: Cadena de conexión Postgres (si se define, la app usa Postgres para meta/detalle/bitácora)

### Ejemplo

```bash
export PORT=8080
export ARTWORKS_DIR=../art
export ADMIN_TOKEN=cambia-esto-por-un-token-largo
export DATABASE_URL="postgres://alexis:alexis_password@localhost:5433/alexis_art?sslmode=disable"
go run .
```

### Estructura esperada en el bucket (S3)

Las llaves (keys) deben seguir el mismo layout que el filesystem:

```
<artwork-id>/<archivo>
```

Ejemplos:

- `cisne/CZEvBMILM8w_2.jpg`
- `aguila/DKS6SvEuSHd_1.mp4`
- `a-la-espera/bitacora.txt`
- `a-la-espera/detalle.txt`
- `a-la-espera/meta.json`

## Endpoints Admin (Backoffice)

Requieren header:

`Authorization: Bearer <ADMIN_TOKEN>`

- `GET /api/v1/admin/artworks`
- `GET /api/v1/admin/artworks/{id}`
- `PUT /api/v1/admin/artworks/{id}` (guarda `meta.json`, `detalle.txt`, `bitacora.txt`)

## Instalación y ejecución

```bash
# Instalar dependencias
go mod download

# Ejecutar
go run main.go

# O compilar
go build -o server
./server
```

## Estructura de carpetas esperada

```
art/
├── obra-1/
│   ├── imagen1.jpg
│   ├── imagen2.jpg
│   ├── video1.mp4
│   └── bitacora.txt
├── obra-2/
│   └── ...
```

