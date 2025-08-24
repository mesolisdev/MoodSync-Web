import React, { useState } from "react";
import { useFavorites } from "../store/favoritesStore";
import { useDropdown } from "../hooks/useDropdown";

export default function PlaylistCard({ cover, title, subtitle, count, onClick, playlist }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isOpen, toggle, close, dropdownRef } = useDropdown();
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Crear objeto playlist si no se proporciona
  const playlistData = playlist || {
    id: title, // fallback usando title como ID si no hay playlist object
    title,
    cover,
    count,
    subtitle
  };

  const isPlaylistFavorite = isFavorite(playlistData.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Evitar que active el onClick del card
    toggleFavorite(playlistData);
  };

  const handleMoreOptionsClick = (e) => {
    e.stopPropagation(); // Evitar que active el onClick del card
    toggle();
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const spotifyUrl = playlistData.external_url || `https://open.spotify.com/playlist/${playlistData.id}`;
    
    try {
      await navigator.clipboard.writeText(spotifyUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = spotifyUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
    
    close();
  };

  const handleOpenSpotify = (e) => {
    e.stopPropagation();
    const spotifyUrl = playlistData.external_url || `https://open.spotify.com/playlist/${playlistData.id}`;
    window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
    close();
  };

  return (
    <div
      className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 shadow-sm overflow-hidden hover:shadow-md transition-all"
    >
      {/* Cover / placeholder */}
      <div
        className="aspect-[16/11] w-full bg-zinc-100 dark:bg-zinc-800 grid place-items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-t-2xl"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Abrir playlist ${title}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid place-items-center">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600 grid place-items-center text-zinc-400">
              ⏯
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {subtitle}
              </p>
            )}
            {typeof count === "number" && (
              <p className="text-sm text-zinc-400 mt-1">{count} canciones</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleFavoriteClick}
              className={`transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 rounded p-1 ${
                isPlaylistFavorite 
                  ? "text-rose-500 hover:text-rose-600" 
                  : "text-zinc-400 hover:text-rose-500"
              }`}
              title={isPlaylistFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-label={`${isPlaylistFavorite ? "Quitar" : "Agregar"} ${title} ${isPlaylistFavorite ? "de" : "a"} favoritos`}
            >
              {isPlaylistFavorite ? "❤️" : "♡"}
            </button>
            
            {/* Dropdown de más opciones */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleMoreOptionsClick}
                className={`text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 rounded p-1 ${
                  isOpen ? "text-zinc-600 dark:text-zinc-200" : ""
                }`}
                title="Más opciones"
                aria-label={`Más opciones para ${title}`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
              >
                {copyFeedback ? "✓" : "⋯"}
              </button>
              
              {isOpen && (
                <div 
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-10"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <button
                    onClick={handleOpenSpotify}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    🎵 Abrir en Spotify
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    role="menuitem"
                  >
                    🔗 Copiar enlace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
