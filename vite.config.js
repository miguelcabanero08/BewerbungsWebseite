import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Leitet Frontend-Aufrufe an /api/* im Dev-Modus an den Express-Server weiter,
      // damit Browser alles als gleiche Origin sieht (kein CORS, Cookies funktionieren).
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
