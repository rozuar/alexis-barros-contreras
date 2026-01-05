# Mobile App - React Native

Aplicación móvil React Native para el portafolio de Alexis Anibal Barros Contreras.

## Características

- React Native con TypeScript
- Navegación con React Navigation
- Integración con API backend
- Diseño nativo para iOS y Android

## Requisitos

- Node.js >= 18
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

## Instalación

```bash
npm install
```

Para iOS:
```bash
cd ios && pod install && cd ..
```

## Configuración

Edita `src/services/api.ts` para configurar la URL del backend:

```typescript
const API_URL = 'http://localhost:8080'; // Cambia por tu URL
```

**Nota**: Para Android, usa `http://10.0.2.2:8080` en lugar de `localhost`.

## Ejecución

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Estructura

```
mobile/
├── src/
│   ├── screens/          # Pantallas de la app
│   ├── services/          # Servicios API
│   └── types/             # Tipos TypeScript
├── App.tsx                # Componente principal
└── ...
```

## Pantallas

- **Home**: Pantalla principal con menú
- **ArtworkList**: Lista de todas las obras
- **ArtworkDetail**: Detalle de una obra con imágenes y bitácora
- **About**: Información sobre el artista
- **Contact**: Formulario de contacto

