import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1주일
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
      includeAssets: ["vite.svg"],
      manifest: {
        name: "DEX Frontend",
        short_name: "DEX",
        description: "DEX Frontend Application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
