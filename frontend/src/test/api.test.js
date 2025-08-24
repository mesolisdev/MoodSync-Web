import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchPlaylists, fetchTracks } from '../lib/api';

// Mock fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Functions', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchPlaylists', () => {
    it('should fetch playlists for a given mood', async () => {
      const mockResponse = {
        mood: 'happy',
        items: [
          { id: '1', name: 'Happy Playlist', images: [{ url: 'image.jpg' }] }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchPlaylists('feliz');
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spotify/playlists?mood=happy&limit=12',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          })
        })
      );
      
      expect(result).toEqual(mockResponse.items);
    });

    it('should handle connection errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(fetchPlaylists('feliz')).rejects.toThrow(
        'No se pudo conectar con el servidor'
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(fetchPlaylists('feliz')).rejects.toThrow('Server error');
    });
  });

  describe('fetchTracks', () => {
    it('should fetch tracks for a given playlist', async () => {
      const mockResponse = {
        tracks: [
          { id: '1', name: 'Track 1', artists: 'Artist 1' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchTracks('playlist123');
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/spotify/playlist/playlist123/tracks',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
          })
        })
      );
      
      expect(result).toEqual(mockResponse.tracks);
    });
  });
});
