import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    proxy: {
      '/upload': 'http://localhost:8000',
      '/analyze': 'http://localhost:8000',
      '/onboarding': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
      '/download': 'http://localhost:8000',
      '/search': 'http://localhost:8000',
      '/monitoring': 'http://localhost:8000',
    },
  },
})
