import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // ✅ Configuración de desarrollo
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  
  // ✅ Optimización de build
  build: {
    sourcemap: false, // No incluir sourcemaps en producción
    minify: 'esbuild', // Usar esbuild para minificación más rápida
    target: 'esnext', // Target moderno para mejor optimización
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependencias grandes en chunks independientes
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
        // Nombres de archivos con hash para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Límite de advertencia para chunks grandes
    chunkSizeWarningLimit: 1000,
  },
  
  // ✅ Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
  
  // ✅ Configuración de preview
  preview: {
    port: 4173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});