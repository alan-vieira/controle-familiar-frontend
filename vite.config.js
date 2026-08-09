// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      skipWaiting: true,              // ✅ NOVO: SW novo assume controle imediato
      clientsClaim: true,             // ✅ NOVO: SW assume clientes existentes
      cleanupOutdatedCaches: true,    // ✅ NOVO: remove caches de versões antigas
      devOptions: {
        enabled: false // PWA só ativo em produção
      },
      manifest: {
        version: '0.1.4',             // ✅ NOVO: cache busting (sincronizar com package.json)
        name: 'Controle Familiar',
        short_name: 'ControleFam',
        description: 'Gerenciamento financeiro familiar',
        theme_color: '#1e40af', // azul do Tailwind (bg-blue-800)
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    open: true
  }
});