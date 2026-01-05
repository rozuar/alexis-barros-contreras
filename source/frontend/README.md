# Frontend - Next.js 14

Frontend web moderno tipo app para el portafolio de Alexis Anibal Barros Contreras.

## Características

- Next.js 14 con App Router
- TypeScript
- Diseño responsive tipo app
- Componentes modulares
- Integración con API backend

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Configuración

Crea un archivo `.env.local` para configurar la URL del API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Proxy recomendado (para evitar CORS y problemas de env)

El frontend consume la API vía rutas relativas (`/api/v1/...`) y Next hace proxy al backend.
Configura el backend destino con:

```env
BACKEND_URL=http://localhost:8090
```

## Contacto (botones en vista de obra)

Puedes configurar los botones de contacto (Email / WhatsApp / Instagram) con variables de entorno:

```env
NEXT_PUBLIC_CONTACT_EMAIL=1819@1819.es
NEXT_PUBLIC_WHATSAPP_PHONE=56912345678
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/tuusuario
```

Nota: `NEXT_PUBLIC_WHATSAPP_PHONE` en formato E.164 **sin** `+`.

## Metadatos por obra (lugar + fechas)

En cada carpeta de obra puedes agregar un archivo `meta.json` para mostrar en el Detalle:

```json
{
  "paintedLocation": "Colina, Chile",
  "startDate": "2025-01-10",
  "endDate": "2025-02-02"
}
```

- Si la obra está en **progreso** (según `NEXT_PUBLIC_IN_PROGRESS_IDS`), en vez de `endDate` se mostrará “desde {startDate} — En progreso”.

## Estructura

```
frontend/
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx         # Página principal
│   └── globals.css      # Estilos globales
├── components/
│   ├── Navigation.tsx   # Navegación
│   ├── Hero.tsx         # Sección hero
│   ├── About.tsx        # Sección about
│   ├── ArtworkGrid.tsx  # Grid de obras
│   ├── ArtworkModal.tsx # Modal de obra
│   └── Contact.tsx      # Formulario de contacto
└── ...
```

## Build

```bash
npm run build
npm start
```

