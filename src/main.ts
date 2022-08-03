import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { SAGEdit } from "@/SAGEdit"

// current screen size
const gameWidth = 1920
const gameHeight = 1080

loadFonts()

const pinia = createPinia().use(piniaPluginPersistedstate)

// // Initialise Pixi (with a "black" default bg color)
// SAGEdit.initialize(gameWidth, gameHeight, 0x6495ed) //0x0)

createApp(App).use(vuetify).use(pinia).mount("#app")
