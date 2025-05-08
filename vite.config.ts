import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa' // Import PWA plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically update SW
      injectRegister: 'auto', // Inject SW registration script
      devOptions: {
        enabled: true // Enable PWA in development for testing
      },
      manifest: {
        name: 'React PWA Starter',
        short_name: 'ReactPWA',
        description: 'A starter template for React PWAs with Vite, TS, Tailwind, and Shadcn/ui.',
        theme_color: '#ffffff', // Light theme color
        background_color: '#ffffff', // Splash screen background
        display: 'standalone', // App-like display
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png', // Path relative to public folder
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png', // Path relative to public folder
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-icon-512x512.png', // Maskable icon
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // Important for maskable icons
          },
        ],
      },
      workbox: {
        // Workbox options for service worker generation
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf,eot}'], // Cache these file types
        runtimeCaching: [ // Example caching strategies
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          // Example: Cache API calls with NetworkFirst
          // {
          //   urlPattern: /^https:\/\/api\.example\.com\/.*/i,
          //   handler: 'NetworkFirst',
          //   options: {
          //     cacheName: 'api-cache',
          //     expiration: {
          //       maxEntries: 50,
          //       maxAgeSeconds: 60 * 60 * 24 * 1 // 1 day
          //     },
          //     cacheableResponse: {
          //       statuses: [0, 200]
          //     }
          //   }
          // }
        ]
      }
    })
  ],
})