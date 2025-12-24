# Proyecto Alexis Art - Arquitectura Separada

Proyecto completo para el portafolio de Alexis Anibal Barros Contreras con arquitectura separada en tres partes: backend, frontend web y aplicación móvil.

## Estructura del Proyecto

```
art/
├── art/                    # Carpetas con obras de arte
│   ├── obra-1/
│   │   ├── imagen1.jpg
│   │   ├── imagen2.jpg
│   │   ├── video1.mp4
│   │   └── bitacora.txt
│   └── ...
├── backend/                # API REST en Go
├── frontend/               # Web app en Next.js 14
├── mobile/                 # App móvil en React Native
└── legacy/                 # Archivos antiguos (HTML estático)
```

## Componentes

### 1. Backend (Go)

API REST que sirve las obras, imágenes, videos y bitácoras.

**Ubicación**: `backend/`

**Características**:
- API REST con Gorilla Mux
- CORS configurado
- Escaneo automático de carpetas
- Servicio de archivos estáticos

**Ejecución**:
```bash
cd backend
go mod download
export ADMIN_TOKEN="cambia-esto-por-un-token-largo"
go run .
```

**Puerto**: 8080 (configurable con variable de entorno `PORT`)

### 2. Frontend Web (Next.js 14)

Aplicación web moderna tipo app con Next.js 14 y TypeScript.

**Ubicación**: `frontend/`

**Características**:
- Next.js 14 con App Router
- TypeScript
- Diseño responsive
- Componentes modulares

**Ejecución**:
```bash
cd frontend
npm install
npm run dev
```

**Puerto**: 3000

**Configuración**: Crea `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Mobile App (React Native)
### 4. Backoffice (Admin)

Panel administrativo para mantener la app (metadatos/detalle/bitácora/“en progreso”).

**Ubicación**: `backoffice/`

**Ejecución**:

```bash
cd backoffice
npm install
BACKEND_URL=http://localhost:8090 npm run dev
```

Abrir: `http://localhost:3011`


Aplicación móvil nativa para iOS y Android.

**Ubicación**: `mobile/`

**Características**:
- React Native con TypeScript
- React Navigation
- Diseño nativo

**Ejecución**:
```bash
cd mobile
npm install
# Para iOS
cd ios && pod install && cd ..
npm run ios
# Para Android
npm run android
```

**Configuración**: Edita `src/services/api.ts` para cambiar la URL del backend.

## Inicio Rápido

1. **Iniciar Backend**:
   ```bash
   cd backend
   go run main.go
   ```

2. **Iniciar Frontend Web** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Iniciar Mobile App** (en otra terminal):
   ```bash
   cd mobile
   npm install
   npm run android  # o npm run ios
   ```

## API Endpoints

### GET /api/v1/artworks
Lista todas las obras disponibles.

### GET /api/v1/artworks/{id}
Obtiene los detalles de una obra específica.

### GET /api/v1/artworks/{id}/images/{filename}
Sirve una imagen específica.

### GET /api/v1/artworks/{id}/videos/{filename}
Sirve un video específico.

### GET /health
Health check.

## Estructura de Obras

Cada obra está en una carpeta dentro de `art/`:

```
art/
└── nombre-obra/
    ├── imagen1.jpg
    ├── imagen2.jpg
    ├── video1.mp4
    └── bitacora.txt  # Opcional
```

El backend escanea automáticamente estas carpetas y genera la API.

## Variables de Entorno

### Backend
- `PORT`: Puerto del servidor (default: 8080)
- `ARTWORKS_DIR`: Directorio de obras (default: ../art)

### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend (default: http://localhost:8080)

### Mobile
Editar directamente en `src/services/api.ts`

## Desarrollo

Cada componente puede desarrollarse independientemente:

- **Backend**: API REST estándar, puede probarse con Postman o curl
- **Frontend**: Desarrollo con hot-reload en Next.js
- **Mobile**: Desarrollo con React Native hot-reload

## Producción

### Backend
```bash
cd backend
go build -o server
./server
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Mobile
```bash
cd mobile
# Android
npm run android -- --variant=release
# iOS
npm run ios -- --configuration Release
```

## Notas

- El backend debe estar corriendo para que frontend y mobile funcionen
- Para Android, usa `http://10.0.2.2:8080` en lugar de `localhost`
- Para iOS en simulador, usa `http://localhost:8080`
- Para dispositivos físicos, usa la IP de tu máquina
