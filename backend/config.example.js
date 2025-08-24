// config.example.js
// Copia este archivo como .env en la raíz del backend y completa los valores

/**
 * Configuración de ejemplo para el backend de MoodSync
 * 
 * Pasos para configurar:
 * 1. Ve a https://developer.spotify.com/dashboard
 * 2. Crea una nueva aplicación
 * 3. Copia el Client ID y Client Secret
 * 4. Crea un archivo .env en la raíz del backend con:
 * 
 * SPOTIFY_CLIENT_ID=tu_client_id_aqui
 * SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
 * PORT=4000
 * NODE_ENV=development
 */

export const requiredEnvVars = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET'
];

export const optionalEnvVars = {
  PORT: '4000',
  NODE_ENV: 'development',
  CORS_ORIGIN: 'http://localhost:5173'
};
