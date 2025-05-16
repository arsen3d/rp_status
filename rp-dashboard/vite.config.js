import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false,
    port: 5173,
    // Allow debugging from external devices
    host: true
  },
  build: {
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable chunk splitting for easier debugging
      }
    }
  }
})
