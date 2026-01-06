# Proyecto Alexis Art - Arquitectura Separada

Proyecto completo para el portafolio de Alexis Anibal Barros Contreras con arquitectura separada en tres partes: backend, frontend web y aplicación móvil.

## Estructura del Proyecto

```
alexis-barros-contreras/
├── source/                 # Código fuente de todos los componentes
│   ├── backend/           # API REST en Go
│   ├── frontend/          # Web app en Next.js 14
│   ├── backoffice/        # Panel administrativo en Next.js 14
│   ├── mobile/            # App móvil en React Native
│   ├── deploy/            # Configuraciones de deployment
│   ├── docker-compose.yml # Orquestación de servicios
│   └── CI-CD.md          # Documentación de CI/CD
├── context/               # Archivos de contexto y documentación
├── .github/               # GitHub Actions workflows
├── MANUAL_BACKOFFICE.md  # Manual de usuario del backoffice
└── README.md             # Este archivo
```

## Componentes

### 1. Backend (Go)

API REST que sirve las obras, imágenes, videos y bitácoras.

**Ubicación**: `source/backend/`

**Características**:
- API REST con Gorilla Mux
- CORS configurado
- PostgreSQL como base de datos
- Autenticación con tokens
- Gestión completa de obras (CRUD)

**Ejecución**:
```bash
cd source/backend
go mod download
export ADMIN_TOKEN="cambia-esto-por-un-token-largo"
export DATABASE_URL="postgres://alexis:alexis_password@localhost:5433/alexis_art?sslmode=disable"
go run .
```

**Puerto**: 8080 (configurable con variable de entorno `PORT`)

### 2. Frontend Web (Next.js 14)

Aplicación web moderna tipo app con Next.js 14 y TypeScript.

**Ubicación**: `source/frontend/`

**Características**:
- Next.js 14 con App Router
- TypeScript
- Diseño responsive
- Componentes modulares
- Visualización de obras de arte
- Galerías de imágenes y videos

**Ejecución**:
```bash
cd source/frontend
npm install
npm run dev
```

**Puerto**: 3000

**Configuración**: Crea `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Backoffice (Next.js 14)

Panel administrativo para gestionar las obras de arte.

**Ubicación**: `source/backoffice/`

**Características**:
- Gestión completa de obras (crear, editar, eliminar)
- Administración de metadatos
- Carga y organización de imágenes
- Gestión de bitácoras
- Estados de obras (en progreso/finalizadas)
- Modal de confirmación para eliminaciones
- Autenticación con tokens

**Ejecución**:
```bash
cd source/backoffice
npm install
npm run dev
```

**Puerto**: 3001

**Configuración**: Crea `.env.local`:
```env
BACKEND_URL=http://localhost:8080
```

**Documentación**: Ver [MANUAL_BACKOFFICE.md](./MANUAL_BACKOFFICE.md) para instrucciones detalladas de uso.

### 4. Mobile App (React Native)

Aplicación móvil nativa para iOS y Android.

**Ubicación**: `source/mobile/`

**Características**:
- React Native con TypeScript
- React Navigation
- Diseño nativo
- Visualización de obras
- Galerías multimedia

**Ejecución**:
```bash
cd source/mobile
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
   cd source/backend
   export ADMIN_TOKEN="tu-token-seguro"
   export DATABASE_URL="postgres://user:password@localhost:5432/alexis_art?sslmode=disable"
   go run .
   ```

2. **Iniciar Frontend Web** (en otra terminal):
   ```bash
   cd source/frontend
   npm install
   npm run dev
   ```

3. **Iniciar Backoffice** (en otra terminal):
   ```bash
   cd source/backoffice
   npm install
   npm run dev
   ```

4. **Iniciar Mobile App** (opcional, en otra terminal):
   ```bash
   cd source/mobile
   npm install
   npm run android  # o npm run ios
   ```

## API Endpoints

### Endpoints Públicos

**GET /api/v1/artworks**
Lista todas las obras disponibles.

**GET /api/v1/artworks/{id}**
Obtiene los detalles de una obra específica.

**GET /api/v1/artworks/{id}/images/{filename}**
Sirve una imagen específica.

**GET /api/v1/artworks/{id}/videos/{filename}**
Sirve un video específico.

**GET /health**
Health check del servidor.

### Endpoints Administrativos

Requieren autenticación con token en header `Authorization: Bearer {token}`

**GET /api/v1/admin/artworks**
Lista todas las obras (con información administrativa).

**POST /api/v1/admin/artworks**
Crea una nueva obra.

**GET /api/v1/admin/artworks/{id}**
Obtiene detalles administrativos de una obra.

**PUT /api/v1/admin/artworks/{id}**
Actualiza metadatos de una obra.

**DELETE /api/v1/admin/artworks/{id}**
Elimina una obra permanentemente.

**POST /api/v1/admin/artworks/{id}/images**
Sube una nueva imagen a una obra.

**DELETE /api/v1/admin/artworks/{id}/images/{filename}**
Elimina una imagen de una obra.

## Gestión de Obras

Las obras se gestionan a través del backoffice y se almacenan en PostgreSQL. Cada obra contiene:

- **Metadatos**: título, fecha de inicio/fin, estado (en progreso/finalizada)
- **Imágenes**: múltiples imágenes con soporte para imagen principal
- **Videos**: archivos de video asociados
- **Bitácora**: texto descriptivo del proceso creativo

Los archivos multimedia se almacenan en el sistema de archivos del servidor y se sirven a través de la API.

## Variables de Entorno

### Backend
- `PORT`: Puerto del servidor (default: 8080)
- `DATABASE_URL`: Conexión a PostgreSQL (requerido)
- `ADMIN_TOKEN`: Token para autenticación administrativa (requerido)
- `UPLOADS_DIR`: Directorio para archivos subidos (default: ./uploads)

### Frontend
- `NEXT_PUBLIC_API_URL`: URL del backend (default: http://localhost:8080)

### Backoffice
- `BACKEND_URL`: URL del backend para server-side (default: http://localhost:8080)
- `NEXT_PUBLIC_API_URL`: URL del backend para client-side (default: http://localhost:8080)

### Mobile
Editar directamente en `src/services/api.ts`

## Desarrollo

Cada componente puede desarrollarse independientemente:

- **Backend**: API REST estándar, puede probarse con Postman o curl
- **Frontend**: Desarrollo con hot-reload en Next.js
- **Backoffice**: Interfaz administrativa con hot-reload
- **Mobile**: Desarrollo con React Native hot-reload

## Producción

### Backend
```bash
cd source/backend
go build -o server
./server
```

### Frontend
```bash
cd source/frontend
npm run build
npm start
```

### Backoffice
```bash
cd source/backoffice
npm run build
npm start
```

### Deploy en Railway con CI/CD

El proyecto está configurado con GitHub Actions para CI/CD automático:

**Servicios desplegados**:
- **Backend Go** - API REST con PostgreSQL
- **Frontend Next.js** - Aplicación web pública
- **Backoffice Next.js** - Panel administrativo

**Pipeline CI/CD**:
- Tests automáticos en cada push/PR
- Linting y análisis de código
- Deploy automático a Railway desde rama `main`

**Configuración Railway**:
- `RAILWAY_TOKEN`: Token de API Railway (GitHub secret)
- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_TOKEN`: Token para autenticación administrativa
- `NEXT_PUBLIC_API_URL`: URL del backend para clientes
- `BACKEND_URL`: URL del backend para server-side

**Ver detalles**: [source/CI-CD.md](./source/CI-CD.md)

### Mobile
```bash
cd source/mobile
# Android
npm run android -- --variant=release
# iOS
npm run ios -- --configuration Release
```

## Notas

### Desarrollo Local
- El backend debe estar corriendo para que frontend, backoffice y mobile funcionen
- Se requiere una instancia de PostgreSQL configurada
- El token de administración debe configurarse en el backend

### Mobile
- Para Android emulador, usa `http://10.0.2.2:8080` en lugar de `localhost`
- Para iOS simulador, usa `http://localhost:8080`
- Para dispositivos físicos, usa la IP de tu máquina en la red local

### Seguridad
- Nunca commitees el `ADMIN_TOKEN` en el código
- Usa variables de entorno para credenciales sensibles
- El backoffice requiere autenticación para todas las operaciones

## Documentación Adicional

- [Manual de Usuario del Backoffice](./MANUAL_BACKOFFICE.md) - Guía completa de uso del panel administrativo
- [CI/CD](./source/CI-CD.md) - Configuración de integración y despliegue continuo
