import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/favicon.ico", "/icon-192.png", "/icon-512.png", "/guincho.png"],
      manifest: {
        name: "Vistorias - Sistema de Guincho",
        short_name: "Vistorias",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f4c81",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,txt,json}"],
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*|\/v1\/.*/,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", networkTimeoutSeconds: 5 }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 }
            }
          },
          {
            urlPattern: /\.(?:ttf|woff2?)$/,
            handler: "CacheFirst",
            options: { cacheName: "fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 3600 } }
          }
        ]
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
