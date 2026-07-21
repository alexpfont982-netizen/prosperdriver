import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      workbox: {
        // Activa el Service Worker nuevo de inmediato, sin esperar a que
        // se cierren todas las pestañas/instancias de la app abiertas.
        skipWaiting: true,
        clientsClaim: true,
        // Borra automáticamente las cachés de versiones anteriores.
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'ProsperDriver',
        short_name: 'ProsperDriver',
        description: 'Control financiero para choferes de apps de transporte',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})