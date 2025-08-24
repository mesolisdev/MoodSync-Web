import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

const FAVORITES_STORAGE_KEY = "moodsync_favorites";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Cargar favoritos del localStorage al inicializar
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          console.log('✅ Favoritos cargados:', parsed.length, 'items');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando favoritos del localStorage:', error);
    }
  }, []);

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      console.log('💾 Favoritos guardados:', favorites.length, 'items');
    } catch (error) {
      console.error('❌ Error guardando favoritos en localStorage:', error);
    }
  }, [favorites]);

  // Agregar a favoritos
  const addToFavorites = (playlist) => {
    if (!playlist || !playlist.id) {
      console.warn('⚠️ Playlist inválida para agregar a favoritos:', playlist);
      return;
    }

    setFavorites(prev => {
      // Evitar duplicados
      if (prev.some(fav => fav.id === playlist.id)) {
        console.log('ℹ️ Playlist ya está en favoritos:', playlist.title);
        return prev;
      }

      const newFavorite = {
        id: playlist.id,
        title: playlist.title,
        cover: playlist.cover,
        count: playlist.count,
        genre: playlist.genre,
        external_url: playlist.external_url,
        addedAt: new Date().toISOString()
      };

      console.log('💝 Agregando a favoritos:', newFavorite.title);
      return [...prev, newFavorite];
    });
  };

  // Quitar de favoritos
  const removeFromFavorites = (playlistId) => {
    if (!playlistId) {
      console.warn('⚠️ ID de playlist inválido para remover de favoritos:', playlistId);
      return;
    }

    setFavorites(prev => {
      const filtered = prev.filter(fav => fav.id !== playlistId);
      if (filtered.length === prev.length) {
        console.log('ℹ️ Playlist no estaba en favoritos:', playlistId);
      } else {
        console.log('💔 Removiendo de favoritos:', playlistId);
      }
      return filtered;
    });
  };

  // Toggle favorito
  const toggleFavorite = (playlist) => {
    if (!playlist || !playlist.id) {
      console.warn('⚠️ Playlist inválida para toggle favorito:', playlist);
      return;
    }

    const isFavorite = favorites.some(fav => fav.id === playlist.id);
    
    if (isFavorite) {
      removeFromFavorites(playlist.id);
    } else {
      addToFavorites(playlist);
    }
  };

  // Verificar si es favorito
  const isFavorite = (playlistId) => {
    return favorites.some(fav => fav.id === playlistId);
  };

  // Limpiar todos los favoritos
  const clearFavorites = () => {
    setFavorites([]);
    console.log('🗑️ Favoritos limpiados');
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return context;
}
