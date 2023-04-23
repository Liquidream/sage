import { createApp } from "vue"
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
import { usePlayerStore, type PlayerState } from "./stores/PlayerStore"

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

// TODO: Populate the "safe" name of game here from data
const nameOfGame = window.sageDataId

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

const worldStore = useWorldStore()
const sceneStore = useSceneStore()
const propStore = usePropStore()
const doorStore = useDoorStore()
const actorStore = useActorStore()
const playerStore = usePlayerStore()

const importPlayData = async (): Promise<void> => {
  console.log(">>> Import release data...")
  const response = await fetch("/sageData.json")
  const sagePlayData = await response.json()
  console.log(">>> (finished retriving release data)")
  
  //debugger
  // Import game data (but only on first run)
//   if (worldStore.currSceneId === "") {
//     // World Data
//     const worldData: WorldState = JSON.parse(sagePlayData.worldData)
//     worldStore.$state = worldData

//     // Scene Data
//     const sceneData: SceneState = JSON.parse(sagePlayData.sceneData)
//     sceneStore.$state = sceneData

//     // Prop Data
//     const propData: PropState = JSON.parse(sagePlayData.propData)
//     propStore.$state = propData

//     // Door Data
//     const doorData: DoorState = JSON.parse(sagePlayData.doorData)
//     doorStore.$state = doorData

//     // Actor Data
//     const actorData: ActorState = JSON.parse(sagePlayData.actorData)
//     actorStore.$state = actorData

//     // Player Data
//     const playerData: PlayerState = JSON.parse(sagePlayData.playerData)
//     playerStore.$state = playerData

//     console.log(">>> (finished importing release data)")
//   }

  loadFonts()

  // Finally, mount the app
  console.log(">>> Mounting #app...")
  app.mount("#app")
}

importPlayData()

// debugger

// prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})
