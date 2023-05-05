import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from "vite-plugin-vuetify"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    plugins: [vue(), vuetify({ autoImport: true })],
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
