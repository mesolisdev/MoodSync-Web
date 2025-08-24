import React, { useEffect } from "react";
import AudioPreview from "./AudioPreview";

export default function PlaylistModal({
  open,
  onClose,
  playlist,          // { id, title, cover, external_url }
  tracks = [],       // [{ id, name, artists, preview_url, albumCover, external_url }]
  loading = false,
  error = "",
}) {
  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className="w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100 shadow-2xl ring-1 ring-white/20 animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header mejorado */}
          <div className="relative flex items-center gap-4 sm:gap-6 p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            {playlist?.cover && (
              <div className="relative">
                <img
                  src={playlist.cover}
                  alt={playlist.title}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl object-cover shadow-lg ring-2 ring-white/10"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold leading-tight mb-2 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {playlist?.title}
              </h3>
              {playlist?.external_url && (
                <a
                  href={playlist.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.203.313-.547.5-.953.5-.281 0-.547-.125-.734-.344L12 13.844l-2.813 2.812c-.187.219-.453.344-.734.344-.406 0-.75-.187-.953-.5C7.313 16.203 7.126 15.859 7.126 15.453c0-.281.125-.547.344-.734L10.282 12 7.47 9.188c-.219-.187-.344-.453-.344-.734 0-.406.187-.75.5-.953.313-.203.656-.313 1-.313.281 0 .547.125.734.344L12 10.344l2.813-2.812c.187-.219.453-.344.734-.344.344 0 .687.11 1 .313.313.203.5.547.5.953 0 .281-.125.547-.344.734L13.718 12l2.812 2.813c.219.187.344.453.344.734 0 .406-.187.75-.5.953z"/>
                  </svg>
                  Abrir en Spotify
                </a>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body mejorado */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-zinc-400">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  Cargando canciones…
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-rose-400 bg-rose-400/10 px-4 py-3 rounded-xl border border-rose-400/20">
                  No se pudieron cargar los tracks.
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-2">
                {tracks.map((t, index) => {
                  const trackUrl =
                    t.external_url || (t.id ? `https://open.spotify.com/track/${t.id}` : undefined);

                  return (
                    <div 
                      key={t.id || trackUrl} 
                      className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={t.albumCover}
                          alt={t.name}
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl object-cover shadow-md ring-1 ring-white/10"
                        />
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold leading-tight truncate text-white group-hover:text-emerald-300 transition-colors">
                          {t.name}
                        </p>
                        <p className="text-sm text-zinc-400 truncate mt-1">
                          {t.artists}
                        </p>
                      </div>

                      {/* Player mejorado */}
                      <AudioPreview src={t.preview_url} fallbackUrl={trackUrl} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
