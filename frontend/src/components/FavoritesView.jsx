import React from "react";
import { useFavorites } from "../store/favoritesStore";
import PlaylistCard from "./PlaylistCard";

export default function FavoritesView({ onPlaylistOpen }) {
  const { favorites, clearFavorites, favoritesCount } = useFavorites();

  if (favoritesCount === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="h-24 w-24 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">
              💝
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
            No tienes favoritos aún
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
            Explora playlists y marca las que más te gusten con el corazón. 
            Aquí podrás encontrarlas fácilmente.
          </p>
          <div className="text-sm text-zinc-500 dark:text-zinc-500">
            💡 Tip: Usa el botón ♡ en cualquier playlist para agregarla a favoritos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Mis Favoritos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {favoritesCount} playlist{favoritesCount !== 1 ? 's' : ''} guardada{favoritesCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {favoritesCount > 0 && (
          <button
            onClick={clearFavorites}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-rose-300 dark:hover:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            title="Limpiar todos los favoritos"
          >
            🗑️ Limpiar todo
          </button>
        )}
      </div>

      {/* Grid de favoritos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {favorites
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)) // Más recientes primero
          .map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              cover={playlist.cover}
              title={playlist.title}
              subtitle={playlist.genre}
              count={playlist.count}
              onClick={() => onPlaylistOpen?.(playlist)}
              playlist={playlist}
            />
          ))}
      </div>

      {/* Footer info */}
      {favoritesCount > 0 && (
        <div className="mt-8 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">ℹ️</span>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">
              <p className="font-medium mb-1">Tus favoritos se guardan localmente</p>
              <p className="text-emerald-600 dark:text-emerald-400">
                Los favoritos se mantienen entre sesiones y solo son visibles en este dispositivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
