import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { SAGEdit } from "./SAGEdit"

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

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

loadFonts()

const pinia = createPinia().use(piniaPluginPersistedstate)

createApp(App).use(vuetify).use(pinia).mount("#app")
