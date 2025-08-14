export async function fetchPlaylists(mood) {
  const res = await fetch(`/api/spotify/playlists?mood=${encodeURIComponent(mood)}`);
  if (!res.ok) throw new Error("Error al obtener playlists");
  return res.json();
}

export async function fetchTracks(playlistId) {
  const res = await fetch(`/api/spotify/playlist/${playlistId}/tracks`);
  if (!res.ok) throw new Error("Error al obtener pistas");
  return res.json();
}
