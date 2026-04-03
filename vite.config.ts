import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Custom middleware to handle SPA routing
    middlewareMode: false,
    fs: {
      strict: true,
    },
    // Configure server to handle SPA routes
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        // Skip ONLY actual API requests (those starting with /api/)
        // Frontend routes like /admin/email-invites should serve index.html
        if (req.url?.startsWith('/api/')) {
          return next()
        }
        
        // For all other routes (including /admin/*, /dashboard, etc.), serve index.html
        const indexPath = path.resolve(__dirname, 'index.html')
        if (fs.existsSync(indexPath)) {
          req.url = '/index.html'
        }
        next()
      })
    },
    proxy: {
      // Proxy all /api/ requests to backend
      '/api/': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  // Explicitly set as SPA
  appType: 'spa',
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
