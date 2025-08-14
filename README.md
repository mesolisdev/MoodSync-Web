
# MoodSync Mini

Aplicación web que, a partir de un estado de ánimo, recomienda playlists públicas de Spotify y adapta la UI con colores, animaciones y transiciones.

## Stack
- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express (Client Credentials Flow)
- **API**: Spotify Web API
- **Hosting**: Vercel

## Funcionalidades
- Selector de _mood_ (feliz, relajado, motivado, melancólico)
- Playlists por mood (búsqueda por keywords)
- Vista de pistas con _preview_ de 30s (si existe `preview_url`)
- Transiciones y fondo animado por mood
- Responsive (mobile first)

## Setup rápido

```bash
# 1) Clonar y entrar
pnpm i --filter ./backend --filter ./frontend

# 2) Variables de entorno
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales de Spotify

# 3) Levantar backend y frontend
pnpm --filter moodsync-backend dev # puerto 4000
pnpm --filter moodsync-frontend dev # puerto 5173
```

> También puedes usar `npm` o `yarn`. Ajusta los comandos equivalentes.

### Spotify Developer
1. Crea una aplicación en https://developer.spotify.com/dashboard
2. Copia el **Client ID** y **Client Secret** en `backend/.env`
3. No necesitas redirect URI (no usamos OAuth de usuario).

## Deploy en Vercel (monorepo)

Este proyecto está listo para desplegar **frontend** y **backend** en un solo repo usando `vercel.json`.

1. Instala Vercel CLI y ejecuta `vercel` en la raíz del repo.
2. Configura variables de entorno para el proyecto en Vercel:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`

### Notas
- El backend se construye como función serverless con `@vercel/node` a partir de `backend/index.js` (Express funciona en modo serverless).
- El frontend usa `@vercel/static-build` (Vite) en `frontend/`.

## Roadmap Sugerido
- Moods adicionales (energético, focus, rainy day)
- Cache por-mood en el backend (KV)
- Accesibilidad: navegación por teclado y `prefers-reduced-motion`
- Pruebas unitarias de utilidades

## Créditos
Diseño y desarrollo por {mesolisdev}.