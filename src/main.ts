import { createApp } from "vue"
import { createPinia } from "pinia"
//import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { SAGEdit } from "./SAGEdit"
import localForage from "localforage"

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const mode = urlParams.get("mode")

if (mode == "play") {
  //let app = createApp(AppServer);
  console.log(">>> Play/Test mode!")
  // console.log(`>>> JSON = ${window.S.JSON}`)
  App.name = "SAGE-Play"
} else {
  //let id = urlParams.get('id')
  //app = createApp(App, { id: parseInt(id) } );
  console.log(">>> Editor mode!")
  // window.S = {}
  // S.JSON = "hello!"
  App.name = "SAGE-Edit"
}

loadFonts()

// Pinia initialisation with localStorage
//const pinia = createPinia().use(piniaPluginPersistedstate)

// Optional
localForage.config({
  driver: localForage.INDEXEDDB, // This force IndexedDB as the driver
})

async function indexDbPlugin({ store }: { store: Store }) {
  const stored = await localForage.getItem(store.$id + "-state")
  if (stored) {
    store.$patch(stored)
  }
  store.$subscribe(() => {
    localForage.setItem(store.$id + "-state", { ...store.$state }) // Destructure to transform to plain object
  })
}

const pinia = createPinia().use(indexDbPlugin)

createApp(App).use(vuetify).use(pinia).mount("#app")
