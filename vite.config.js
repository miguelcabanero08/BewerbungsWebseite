import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Nur für `npm run dev`: leitet /api/* an einen lokalen Server auf Port 3001 weiter.
      // Mit `npm run dev:all` (vercel dev) laufen die echten Functions aus api/ direkt.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
