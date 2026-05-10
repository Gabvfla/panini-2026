import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isPWA = process.env.MODE === 'pwa'

export default defineConfig({
  plugins: [react()],
  base: isPWA ? '/panini-2026/' : './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
