/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import VuetifyUseDialog from 'vuetify-use-dialog'

// Types
import type { App } from 'vue'
import localforage from 'localforage'
import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'

export function registerPlugins (app: App, localforageName: string) {

  // This force IndexedDB as the driver
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: localforageName,
  })
  // Create pinia with persisted (indexedDB) storage
  const pinia = createPinia()
  const persistedStatePlugin = createPersistedStatePlugin({
    storage: {
      getItem: async (key) => {
        return localforage.getItem(key)
      },
      setItem: async (key, value) => {
        return localforage.setItem(key, value)
      },
      removeItem: async (key) => {
        return localforage.removeItem(key)
      },
    },
  })
  pinia.use(persistedStatePlugin)

  app.use(pinia)
  app.use(vuetify)
  app.use(VuetifyUseDialog)
  loadFonts()
}
