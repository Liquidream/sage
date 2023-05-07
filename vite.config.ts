import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify"

import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      VitePWA({
        // registerType: "autoUpdate",
        manifest: {
          name: "SAGE",
          short_name: "SAGE",
          description: "The Simple Adventure Game Engine",
          theme_color: "#002eb8",
          background_color: "#002eb8",
          display: "standalone",
          orientation: "portrait",
          start_url: "/sage",
          icons: [
            {
              src: "images/app-images/192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "images/app-images/512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    // (This is now explicitly specified in separate npm build script)
    //base: command === "build" ? "/sage/" : "/",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // PN added to expose dev server to network ######
    server: {
      host: "0.0.0.0",
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "SAGE.[ext]",
          entryFileNames: "entry-[name].js",
        },
      },
    },
  }
})
