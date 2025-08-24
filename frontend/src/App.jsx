import React, { useCallback, useEffect, useMemo, useState } from "react";
import MoodSelectorCard from "./components/MoodSelectorCard";
import PlaylistCard from "./components/PlaylistCard";
import PlaylistModal from "./components/PlaylistModal";
import MoodBackground from "./components/MoodBackground";
import FavoritesView from "./components/FavoritesView";
import Footer from "./components/Footer";
import { fetchPlaylists, fetchTracks } from "./lib/api";

// ✅ contextos
import { MoodProvider, useMood } from "./store/moodStore";
import { FavoritesProvider, useFavorites } from "./store/favoritesStore";

// ✅ Mover constantes fuera del componente para evitar re-creación
const MOODS = [
  { id: "feliz", label: "Feliz" },
  { id: "relajado", label: "Relajado" },
  { id: "motivado", label: "Motivado" },
  { id: "melancolico", label: "Melancólico" },
  { id: "nostalgico", label: "Nostálgico" },
  { id: "intenso", label: "Intenso" },
];

// ✅ Función para obtener mood aleatorio
const getRandomMood = () => {
  const randomIndex = Math.floor(Math.random() * MOODS.length);
  return MOODS[randomIndex].id;
};

// Mapeo ES → EN para el contexto del fondo
const ES_TO_EN = {
  feliz: "happy",
  relajado: "relaxed",
  motivado: "motivated",
  melancolico: "melancholic",
  nostalgico: "nostalgic",
  intenso: "intense",
};

// ✅ Configuración de moods para el selector (constante)
const MOOD_SELECTOR_CONFIG = [
  { id: "feliz", label: "Feliz", emoji: "☀️", color: "text-amber-500" },
  { id: "melancolico", label: "Melancólico", emoji: "💧", color: "text-sky-500" },
  { id: "motivado", label: "Motivado", emoji: "⚡", color: "text-orange-500" },
  { id: "relajado", label: "Relajado", emoji: "😊", color: "text-emerald-600" },
  { id: "nostalgico", label: "Nostálgico", emoji: "🌙", color: "text-purple-500" },
  { id: "intenso", label: "Intenso", emoji: "🔥", color: "text-red-500" },
];

function Content() {
  // Estado de la UI (ES) - Ahora con mood aleatorio
  const [currentMood, setCurrentMood] = useState(getRandomMood());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [currentView, setCurrentView] = useState("home"); // "home" | "favorites"

  // Estado del modal externo
  const [selected, setSelected] = useState(null);     // { id, title, cover, external_url }
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState("");

  // ✅ contextos
  const { setMood } = useMood();
  const { favoritesCount } = useFavorites();

  // Sincroniza selección ES → contexto EN (también en el primer render)
  useEffect(() => {
    setMood(ES_TO_EN[currentMood] || "relaxed");
  }, [currentMood, setMood]);

  // ✅ Memoizar cálculos derivados
  const moodLabel = useMemo(
    () => MOODS.find((m) => m.id === currentMood)?.label ?? "—",
    [currentMood]
  );

  // ✅ Memoizar función de cambio de mood
  const handleMoodChange = useCallback((newMood) => {
    setCurrentMood(newMood);
  }, []);

  // ✅ Memoizar transformación de playlists
  const transformedPlaylists = useMemo(() => {
    console.log('🔄 Transforming playlists:', playlists.length, 'items');
    const transformed = playlists.map((p) => ({
      id: p.id,
      title: p.name,
      cover: p.images?.[0]?.url,
      count: p.tracks_total ?? p.tracks?.total ?? p.tracksCount,
      genre: p.owner?.display_name ?? p.owner?.id ?? p.genre,
      external_url: p.external_urls?.spotify ?? `https://open.spotify.com/playlist/${p.id}`,
    }));
    console.log('✅ Transformed playlists:', transformed);
    return transformed;
  }, [playlists]);

  // ✅ Cargar playlists por mood optimizado
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    console.log('🔄 Fetching playlists for mood:', currentMood);
    fetchPlaylists(currentMood)
      .then((data) => {
        if (ignore) return;
        console.log('✅ Received playlists data:', data);
        // El backend ahora retorna { mood, items, total }
        const items = data?.items || [];
        console.log('📋 Processing items:', items.length, 'playlists');
        setPlaylists(items); // Ya no necesitamos transformar aquí, lo hacemos en el useMemo
      })
      .catch((e) => {
        if (ignore) return;
        console.error('Error fetching playlists:', e);
        const errorMsg = e.code === 'CONNECTION_ERROR' 
          ? 'No se pudo conectar con el servidor 🌐'
          : 'Ups, no pude traer playlists 😕';
        setError(errorMsg);
        setPlaylists([]);
      })
      .finally(() => !ignore && setLoading(false));

    return () => { ignore = true; };
  }, [currentMood]);

  // ✅ Optimizar función de abrir playlist con useCallback
  const openPlaylist = useCallback(async (pl) => {
    setSelected(pl);
    setTracks([]);
    setTracksError("");
    setTracksLoading(true);

    try {
      const data = await fetchTracks(pl.id);
      const list = data?.tracks || []; // El backend ahora retorna { playlistId, tracks, total }
      
      const normalized = list.map((t) => {
        const tr = t.track ?? t;
        const artists = typeof tr.artists === "string"
          ? tr.artists
          : (tr.artists ?? []).map((a) => a.name ?? a).join(", ");

        return {
          id: tr.id,
          name: tr.name,
          artists,
          preview_url: tr.preview_url ?? null,
          albumCover: t.image || tr.album?.images?.[2]?.url || tr.album?.images?.[0]?.url || pl.cover,
          external_url: tr.external_urls?.spotify || (tr.id ? `https://open.spotify.com/track/${tr.id}` : undefined),
        };
      });

      setTracks(normalized);
    } catch (e) {
      console.error("Error fetching tracks:", e);
      const errorMsg = e.code === 'CONNECTION_ERROR'
        ? 'No se pudo conectar con el servidor 🌐'
        : `No se pudieron cargar los tracks. ${e.message || ""}`;
      setTracksError(errorMsg);
    } finally {
      setTracksLoading(false);
    }
  }, []);

  // ✅ Optimizar función de cerrar playlist con useCallback
  const closePlaylist = useCallback(() => {
    setSelected(null);
    setTracks([]);
    setTracksLoading(false);
    setTracksError("");
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* 🔮 Fondo reactivo al mood (contexto) */}
      <MoodBackground />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 dark:bg-zinc-950/60 backdrop-blur border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center">🎵</div>
            <span className="font-semibold">MoodSync</span>
          </button>
          <nav className="text-sm text-zinc-500 flex items-center gap-5">
            <button 
              onClick={() => setCurrentView("favorites")}
              className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1 ${
                currentView === "favorites" ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
              }`}
            >
              Favoritos
              {favoritesCount > 0 && (
                <span className="bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">

      {/* Contenido condicional basado en la vista actual */}
      {currentView === "home" ? (
        <>
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              MoodSync
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Descubre playlists perfectas para tu estado de ánimo. Deja que la música se adapte a cómo te sientes.
            </p>
          </section>

          {/* Selector de mood (sigue usando ES) */}
          <section className="max-w-6xl mx-auto px-4">
            <MoodSelectorCard
              currentMood={currentMood}
              onMoodChange={handleMoodChange}
              moods={MOOD_SELECTOR_CONFIG}
            />
          </section>

          {/* Listado de playlists */}
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-semibold mb-4">
              Playlists para tu mood:{" "}
              <span className="text-emerald-700 dark:text-emerald-400">{moodLabel}</span>
            </h2>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/70 h-56 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-4 rounded-xl border border-rose-200/60 text-rose-700 bg-rose-50/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {transformedPlaylists.map((pl) => (
                  <PlaylistCard
                    key={pl.id ?? pl.title}
                    cover={pl.cover}
                    title={pl.title}
                    subtitle={pl.genre ?? pl.category}
                    count={pl.count}
                    onClick={() => openPlaylist(pl)}
                    playlist={pl}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Hero para favoritos */}
          <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Mis Favoritos
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Todas las playlists que has marcado como favoritas en un solo lugar.
            </p>
          </section>

          {/* Vista de favoritos */}
          <FavoritesView onPlaylistOpen={openPlaylist} />
        </>
      )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal externo */}
      <PlaylistModal
        open={!!selected}
        onClose={closePlaylist}
        playlist={selected}
        tracks={tracks}
        loading={tracksLoading}
        error={tracksError}
      />
    </div>
  );
}

// Export: App envuelta en los providers de contexto
export default function App() {
  return (
    <MoodProvider>
      <FavoritesProvider>
        <Content />
      </FavoritesProvider>
    </MoodProvider>
  );
}
