import express from "express";
import axios from "axios";

const router = express.Router();

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAppToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 10_000) {
    return cachedToken;
  }
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Faltan SPOTIFY_CLIENT_ID o SPOTIFY_CLIENT_SECRET");
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    params,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000; // segundos → ms
  return cachedToken;
}

const moodKeywords = {
  happy: ["happy", "feel good", "good vibes", "cheerful"],
  relaxed: ["chill", "relax", "lofi", "calm"],
  motivated: ["workout", "focus", "pump", "motivation"],
  melancholic: ["sad", "melancholy", "rainy day", "moody"],
};

function buildQuery(mood) {
  const keys = moodKeywords[mood] || [mood];
  // Pondera términos para mejorar el match
  return keys.map((k) => `playlist:${k}`).join(" OR ");
}

router.get("/playlists", async (req, res) => {
  try {
    const { mood = "happy", limit = 12 } = req.query;
    const token = await getAppToken();
    const q = buildQuery(String(mood).toLowerCase());

    const { data } = await axios.get(
      "https://api.spotify.com/v1/search",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { q, type: "playlist", limit: Math.min(Number(limit) || 12, 20) },
      }
    );

    const items = (data.playlists?.items || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      images: p.images,
      external_url: p.external_urls?.spotify,
      owner: p.owner?.display_name,
      tracks_total: p.tracks?.total,
    }));

    res.json({ mood, items });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "No se pudieron obtener playlists" });
  }
});

router.get("/playlist/:id/tracks", async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getAppToken();
    const { data } = await axios.get(
      `https://api.spotify.com/v1/playlists/${id}/tracks`,
      { headers: { Authorization: `Bearer ${token}` }, params: { market: "US", limit: 50 } }
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

    res.json({ playlistId: id, tracks });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "No se pudieron obtener las pistas" });
  }
});

export default router;
