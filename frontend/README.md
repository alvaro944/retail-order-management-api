# Retail Order Management Frontend

Aplicación web para gestionar productos, clientes, inventario y pedidos de Retail Order Management API. Incluye inicio de sesión con JWT y rutas protegidas para las operaciones del negocio.

## Stack

- React 19 y TypeScript
- Vite 8
- React Router, TanStack Query y Axios
- Tailwind CSS

## Desarrollo

Desde este directorio, instala las dependencias y arranca el servidor de desarrollo:

```bash
npm ci
npm run dev
```

## Build de producción

```bash
npm run build
```

El comando ejecuta la comprobación de tipos de TypeScript y genera la aplicación en `dist/`.

## API

El frontend usa `VITE_API_BASE_URL` como URL base de la API. Si no se define, utiliza `http://localhost:8080/api/v1`.

Para apuntar a otra instancia, define la variable al construir o iniciar Vite:

```bash
VITE_API_BASE_URL=https://api.example.com/api/v1 npm run build
```

La API debe permitir el origen donde se publique el frontend mediante `APP_CORS_ALLOWED_ORIGIN_PATTERNS`; en desarrollo, el backend ya acepta orígenes `localhost` y `127.0.0.1`.
