import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify"

import { VitePWA } from "vite-plugin-pwa"
import mkcert from "vite-plugin-mkcert"
import replace from "@rollup/plugin-replace"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      VitePWA({
        // mode: "development",
        registerType: "prompt", // default behaviour, but just to be explicit
        workbox: {
          // Need to bump up max cache size, as default max = 2MB
          // (+currently the output index.js is over 4MB!)
          maximumFileSizeToCacheInBytes: 9000000,
        },
        manifest: {
          name: "SAGE",
          short_name: "SAGE",
          description: "The Simple Adventure Game Engine",
          theme_color: "#002eb8",
          background_color: "#002eb8",
          display: "standalone",
          //orientation: "portrait",
          // start_url: "/sage", // not needed, as pwa-vite plugin auto sets this for github build!
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
      replace({
        __DATE__: new Date().toISOString(),
      }),
      mkcert(),
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
      https: true,
    },
    build: {
      rollupOptions: {
        input: {
          index_play: "./index-release.html",
        },
        output: {
          assetFileNames: "SAGE.[ext]",
          entryFileNames: "entry-[name].js",
        },
      },
    },
  }
})