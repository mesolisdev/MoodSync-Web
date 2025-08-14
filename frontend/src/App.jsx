import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoodProvider, useMood } from "./store/moodStore";
import MoodPicker from "./components/MoodPicker";
import PlaylistCard from "./components/PlaylistCard";
import AudioPreview from "./components/AudioPreview";
import MoodBackground from "./components/MoodBackground";
import { fetchPlaylists, fetchTracks } from "./lib/api";

function Content() {
  const { mood } = useMood();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [] });
  const [selected, setSelected] = useState(null);
  const palette = useMemo(() => ({
    happy: "mood-happy",
    relaxed: "mood-relaxed",
    motivated: "mood-motivated",
    melancholic: "mood-melancholic",
  })[mood], [mood]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setSelected(null);
    fetchPlaylists(mood)
      .then((d) => alive && setData(d))
      .catch(() => alive && setError("Ups, no pude traer playlists"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [mood]);

  return (
    <div className="min-h-dvh relative p-6 md:p-10">
      <MoodBackground />

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">MoodSync Mini</h1>
          <p className="text-slate-300">Playlists que combinan con tu mood</p>
        </div>
        <MoodPicker />
      </header>

      <main className="mt-8">
        {loading && <div className="text-slate-300">Cargando playlists…</div>}
        {error && <div className="text-red-300">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((it) => (
            <PlaylistCard key={it.id} item={it} onOpen={() => setSelected(it)} />
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card w-full max-w-2xl p-5"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
            >
              <div className="flex items-start gap-4">
                <img src={selected.images?.[0]?.url} alt={selected.name} className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-display text-2xl">{selected.name}</h3>
                  <p className="text-slate-300 text-sm">{selected.description}</p>
                  <a className="text-sky-300 text-sm underline" href={selected.external_url} target="_blank" rel="noreferrer">Abrir en Spotify</a>
                </div>
                <button className="btn bg-white/10" onClick={() => setSelected(null)}>Cerrar</button>
              </div>

              <TrackList playlistId={selected.id} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-10 text-center text-xs text-slate-400">
        Hecho con ❤ por ti. Stack: React + Vite + Tailwind + Framer Motion + Spotify API
      </footer>
    </div>
  );
}

function TrackList({ playlistId }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchTracks(playlistId)
      .then((d) => alive && setTracks(d.tracks || []))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [playlistId]);

  if (loading) return <div className="mt-4 text-slate-300">Cargando canciones…</div>;

  return (
    <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-2">
      {tracks.map((t) => (
        <div key={t.id || t.external_url} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
          <img src={t.image} alt="cover" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <div className="truncate">{t.name}</div>
            <div className="text-xs text-slate-400 truncate">{t.artists} · {t.album}</div>
          </div>
          <AudioPreview src={t.preview_url} />
        </div>
      ))}
      {tracks.length === 0 && (
        <div className="text-slate-400 text-sm">Esta playlist no tiene previews disponibles.</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <MoodProvider>
      <Content />
    </MoodProvider>
  );
}
