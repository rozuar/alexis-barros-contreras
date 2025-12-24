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
- `ADMIN_TOKEN`: Token para endpoints de administración (obligatorio para /api/v1/admin/*)

### Ejemplo

```bash
export PORT=8080
export ARTWORKS_DIR=../art
export ADMIN_TOKEN=cambia-esto-por-un-token-largo
go run main.go
```

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

