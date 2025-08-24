import express from "express";
import axios from "axios";

const router = express.Router();

let cachedToken = null;
let tokenExpiresAt = 0;

// ✅ Cache para playlists
const playlistCache = new Map();
const trackCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 100; // Máximo 100 entradas en cache

// Función para limpiar cache antiguo
function cleanOldCache(cache) {
  if (cache.size <= MAX_CACHE_SIZE) return;
  
  const now = Date.now();
  const entries = Array.from(cache.entries());
  
  // Eliminar entradas expiradas
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  });
  
  // Si aún hay muchas entradas, eliminar las más antiguas
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, cache.size - MAX_CACHE_SIZE);
    
    sortedEntries.forEach(([key]) => cache.delete(key));
  }
}

async function getAppToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 10_000) {
    return cachedToken;
  }
  
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    const error = new Error("Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET");
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }
  
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    
    const { data } = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      { 
        headers: { 
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 segundos timeout
      }
    );
    
    if (!data.access_token) {
      throw new Error("No se recibió access_token de Spotify");
    }
    
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000); // segundos → ms
    
    console.log(`✅ Token de Spotify obtenido correctamente. Expira en ${data.expires_in}s`);
    return cachedToken;
    
  } catch (err) {
    // Limpiar cache en caso de error
    cachedToken = null;
    tokenExpiresAt = 0;
    
    if (err.response) {
      console.error('❌ Error de autenticación Spotify:', {
        status: err.response.status,
        data: err.response.data,
        timestamp: new Date().toISOString()
      });
      
      const spotifyError = new Error(`Spotify Auth Error: ${err.response.status}`);
      spotifyError.code = 'SPOTIFY_AUTH_ERROR';
      spotifyError.status = err.response.status;
      spotifyError.spotifyResponse = err.response.data;
      throw spotifyError;
    }
    
    console.error('❌ Error de conexión con Spotify:', err.message);
    const connectionError = new Error('Error de conexión con Spotify API');
    connectionError.code = 'SPOTIFY_CONNECTION_ERROR';
    connectionError.originalError = err.message;
    throw connectionError;
  }
}

const moodKeywords = {
  happy: ["happy", "feel good", "good vibes", "cheerful"],
  relaxed: ["chill", "relax", "lofi", "calm"],
  motivated: ["workout", "focus", "pump", "motivation"],
  melancholic: ["sad", "melancholy", "rainy day", "moody"],
  nostalgic: ["nostalgic", "throwback", "retro", "classic hits", "memories"],
  intense: ["intense", "party", "high energy", "pump up", "electronic dance"],
};

function buildQuery(mood) {
  const keys = moodKeywords[mood] || [mood];
  // Pondera términos para mejorar el match
  return keys.map((k) => `playlist:${k}`).join(" OR ");
}

router.get("/playlists", async (req, res) => {
  try {
    const { mood = "happy", limit = 12 } = req.query;
    
    // ✅ Validación de entrada
    const validMoods = ['happy', 'relaxed', 'motivated', 'melancholic', 'nostalgic', 'intense'];
    const moodLower = String(mood).toLowerCase();
    
    if (!validMoods.includes(moodLower)) {
      return res.status(400).json({ 
        error: "Mood inválido",
        validMoods,
        provided: mood
      });
    }
    
    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({ 
        error: "Limit debe ser un número entre 1 y 50",
        provided: limit
      });
    }

    // ✅ Verificar cache
    const cacheKey = `${moodLower}-${limitNum}`;
    const now = Date.now();
    
    if (playlistCache.has(cacheKey)) {
      const { data, timestamp } = playlistCache.get(cacheKey);
      if (now - timestamp < CACHE_TTL) {
        console.log(`🚀 Cache hit para playlists: ${cacheKey}`);
        return res.json({ ...data, cached: true, cacheAge: now - timestamp });
      } else {
        playlistCache.delete(cacheKey);
      }
    }

    const token = await getAppToken();
    const q = buildQuery(moodLower);

    const { data } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { q, type: "playlist", limit: Math.min(limitNum, 20) },
      }
    );

    const items = (data.playlists?.items || [])
      .filter(p => p && p.id) // ✅ Filtrar items null o sin ID
      .map((p) => ({
        id: p.id,
        name: p.name || 'Sin título',
        description: p.description || '',
        images: p.images || [],
        external_url: p.external_urls?.spotify || '',
        owner: p.owner?.display_name || 'Desconocido',
        tracks_total: p.tracks?.total || 0,
      }));

    const result = { mood: moodLower, items, total: items.length };
    
    // ✅ Guardar en cache
    cleanOldCache(playlistCache);
    playlistCache.set(cacheKey, { data: result, timestamp: now });
    console.log(`💾 Cache guardado para playlists: ${cacheKey} (${items.length} items)`);

    res.json(result);
  } catch (err) {
    // ✅ Manejo de errores mejorado
    const status = err.response?.status || 500;
    const errorMessage = err.response?.data?.error?.message || err.message;
    const isSpotifyError = err.response?.data?.error;
    
    console.error(`❌ [${status}] Error en /playlists:`, {
      mood: req.query.mood,
      limit: req.query.limit,
      spotifyError: isSpotifyError,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });

    // Respuesta de error estructurada
    const errorResponse = {
      error: "No se pudieron obtener playlists",
      code: isSpotifyError ? 'SPOTIFY_API_ERROR' : 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };

    // En desarrollo, incluir más detalles
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = errorMessage;
      errorResponse.spotifyStatus = status;
    }

    res.status(status >= 400 && status < 500 ? status : 500).json(errorResponse);
  }
});

router.get("/playlist/:id/tracks", async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ Validación de entrada
    if (!id || typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({ 
        error: "ID de playlist inválido",
        provided: id
      });
    }

    // ✅ Verificar cache
    const cacheKey = `tracks-${id}`;
    const now = Date.now();
    
    if (trackCache.has(cacheKey)) {
      const { data, timestamp } = trackCache.get(cacheKey);
      if (now - timestamp < CACHE_TTL) {
        console.log(`🚀 Cache hit para tracks: ${cacheKey}`);
        return res.json({ ...data, cached: true, cacheAge: now - timestamp });
      } else {
        trackCache.delete(cacheKey);
      }
    }

    const token = await getAppToken();
    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${id}/tracks`,
      { 
        headers: { Authorization: `Bearer ${token}` }, 
        params: { market: "US", limit: 50 } 
      }
    );

    const tracks = (data.items || [])
      .map((it) => it.track)
      .filter(Boolean)
      .map((t) => ({
        id: t.id,
        name: t.name,
        artists: t.artists?.map((a) => a.name).join(", "),
        album: t.album?.name,
        preview_url: t.preview_url,
        external_url: t.external_urls?.spotify,
        image: t.album?.images?.[0]?.url,
      }));

    const result = { 
      playlistId: id, 
      tracks, 
      total: tracks.length,
      timestamp: new Date().toISOString()
    };
    
    // ✅ Guardar en cache
    cleanOldCache(trackCache);
    trackCache.set(cacheKey, { data: result, timestamp: now });
    console.log(`💾 Cache guardado para tracks: ${cacheKey} (${tracks.length} tracks)`);

    res.json(result);
  } catch (err) {
    // ✅ Manejo de errores mejorado
    const status = err.response?.status || 500;
    const errorMessage = err.response?.data?.error?.message || err.message;
    const isSpotifyError = err.response?.data?.error;
    
    console.error(`❌ [${status}] Error en /playlist/${req.params.id}/tracks:`, {
      playlistId: req.params.id,
      spotifyError: isSpotifyError,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });

    // Respuesta de error estructurada
    const errorResponse = {
      error: "No se pudieron obtener las pistas",
      code: isSpotifyError ? 'SPOTIFY_API_ERROR' : 'INTERNAL_ERROR',
      playlistId: req.params.id,
      timestamp: new Date().toISOString()
    };

    // En desarrollo, incluir más detalles
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = errorMessage;
      errorResponse.spotifyStatus = status;
    }

    res.status(status >= 400 && status < 500 ? status : 500).json(errorResponse);
  }
});

// ✅ Ruta para consultar estado del cache (solo en desarrollo)
router.get("/cache/stats", (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Ruta no disponible en producción' });
  }

  const now = Date.now();
  
  const playlistStats = {
    size: playlistCache.size,
    entries: Array.from(playlistCache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp,
      expired: (now - value.timestamp) > CACHE_TTL
    }))
  };
  
  const trackStats = {
    size: trackCache.size,
    entries: Array.from(trackCache.entries()).map(([key, value]) => ({
      key,
      age: now - value.timestamp,
      expired: (now - value.timestamp) > CACHE_TTL
    }))
  };

  res.json({
    timestamp: new Date().toISOString(),
    cacheTTL: CACHE_TTL,
    maxCacheSize: MAX_CACHE_SIZE,
    playlists: playlistStats,
    tracks: trackStats
  });
});

// ✅ Ruta para limpiar cache (solo en desarrollo)
router.delete("/cache/clear", (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Ruta no disponible en producción' });
  }

  const playlistCount = playlistCache.size;
  const trackCount = trackCache.size;
  
  playlistCache.clear();
  trackCache.clear();
  
  console.log('🗑️ Cache limpiado manualmente');
  
  res.json({
    message: 'Cache limpiado exitosamente',
    cleared: {
      playlists: playlistCount,
      tracks: trackCount
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
