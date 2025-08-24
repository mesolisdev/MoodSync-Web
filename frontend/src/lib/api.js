const API_BASE = import.meta.env.VITE_API_BASE || ""; // ej. "http://localhost:4000"

const MOOD_MAP = {
  feliz: "happy",
  relajado: "relaxed",
  motivado: "motivated",
  melancolico: "melancholic",
  nostalgico: "nostalgic",
  intenso: "intense",
};

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15000 // 15 segundos timeout
    });
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: await res.text().catch(() => "Error desconocido") };
      }
      
      const error = new Error(errorData.error || `HTTP ${res.status}`);
      error.status = res.status;
      error.code = errorData.code;
      error.details = errorData.details;
      error.timestamp = errorData.timestamp;
      throw error;
    }
    
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      // Error de conexión
      const connectionError = new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
      connectionError.code = 'CONNECTION_ERROR';
      throw connectionError;
    }
    
    // Re-lanzar otros errores
    throw err;
  }
}

export async function fetchPlaylists(moodId) {
  const mood = MOOD_MAP[moodId] || moodId; // acepta ES o EN
  const data = await safeFetchJson(`${API_BASE}/api/spotify/playlists?mood=${encodeURIComponent(mood)}&limit=12`);
  // backend retorna { mood, items, total }
  console.log('📥 API Response for playlists:', data); // Debug log
  return data; // Devolver toda la respuesta, no solo items
}

export async function fetchTracks(playlistId) {
  const data = await safeFetchJson(`${API_BASE}/api/spotify/playlist/${playlistId}/tracks`);
  console.log('📥 API Response for tracks:', data); // Debug log
  return data; // Devolver toda la respuesta
}
