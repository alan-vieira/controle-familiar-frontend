// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // PWA só ativo em produção
      },
      manifest: {
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