import { createApp, type App } from "vue"
import { createPinia } from "pinia"
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2"
import localforage from "localforage"
import AppPlay from "./AppPlay.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { useWorldStore, type WorldState } from "./stores/WorldStore"
import { useSceneStore, type SceneState } from "./stores/SceneStore"
import { usePropStore, type PropState } from "./stores/PropStore"
import { useDoorStore, type DoorState } from "./stores/DoorStore"
import { useActorStore, type ActorState } from "./stores/ActorStore"
import { SAGE } from "./pixi-sageplay/SAGEPlay"

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

// TODO: Populate the "safe" name of game here from data
const nameOfGame = "TODO"

//const queryString = window.location.search
//const urlParams = new URLSearchParams(queryString)

// ------------------------------
// Release Mode
// ------------------------------
console.log(">>> Release mode!")

// Expose to JavaScript/Browser console
window.SAGE = SAGE

AppPlay.name = `SAGE-${nameOfGame}`
// This force IndexedDB as the driver
localforage.config({
  driver: localforage.INDEXEDDB,
  name: AppPlay.name,
})
// Create pinia with persisted (indexedDB) storage
const pinia = createPinia()
pinia.use(
  createPersistedStatePlugin({
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
)
const app = createApp(AppPlay).use(vuetify).use(pinia)

// --------------------------------
// Restore release data
// --------------------------------
console.log(">>> Load release data")

const sagePlayData = window.opener.sagePlayData
// World Data
const worldStore = useWorldStore()
const worldData: WorldState = JSON.parse(sagePlayData.worldData)
worldStore.$state = worldData

// Scene Data
const sceneStore = useSceneStore()
const sceneData: SceneState = JSON.parse(sagePlayData.sceneData)
sceneStore.$state = sceneData

// Prop Data
const propStore = usePropStore()
const propData: PropState = JSON.parse(sagePlayData.propData)
propStore.$state = propData

// Door Data
const doorStore = useDoorStore()
const doorData: DoorState = JSON.parse(sagePlayData.doorData)
doorStore.$state = doorData

// Actor Data
const actorStore = useActorStore()
const actorData: ActorState = JSON.parse(sagePlayData.actorData)
actorStore.$state = actorData

// debugger

console.log(">>> (finished loading test data)")

loadFonts()

// Finally, mount the app
console.log(">>> Mounting #app...")
app.mount("#app")

// prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})
