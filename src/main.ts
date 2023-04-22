import { createApp, type App } from "vue"
import { createPinia } from "pinia"
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2"
import localforage from "localforage"
import AppEdit from "./AppEdit.vue"
import AppPlay from "./AppPlay.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { useWorldStore, type WorldState } from "./stores/WorldStore"
import { useSceneStore, type SceneState } from "./stores/SceneStore"
import { usePropStore, type PropState } from "./stores/PropStore"
import { useDoorStore, type DoorState } from "./stores/DoorStore"
import { useActorStore, type ActorState } from "./stores/ActorStore"
import { SAGE } from "./pixi-sageplay/SAGEPlay"
import type { SagePlayData } from "./pixi-sageplay/SagePlayData"

let app: App

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let mode = urlParams.get("mode")
let sagePlayData: any

const storePlayData = function (playData: SagePlayData) {
  debugger
  // World Data
  const worldStore = useWorldStore()
  const worldData: WorldState = JSON.parse(playData.worldData)
  worldStore.$state = worldData

  // Scene Data
  const sceneStore = useSceneStore()
  const sceneData: SceneState = JSON.parse(playData.sceneData)
  sceneStore.$state = sceneData

  // Prop Data
  const propStore = usePropStore()
  const propData: PropState = JSON.parse(playData.propData)
  propStore.$state = propData

  // Door Data
  const doorStore = useDoorStore()
  const doorData: DoorState = JSON.parse(playData.doorData)
  doorStore.$state = doorData

  // Actor Data
  const actorStore = useActorStore()
  const actorData: ActorState = JSON.parse(playData.actorData)
  actorStore.$state = actorData
}

const initStore = function () {
  if (mode === "release") {
    // ------------------------------
    // Release Mode
    // ------------------------------
    console.log(">>> Release mode!")

    // Expose to JavaScript/Browser console
    window.SAGE = SAGE

    //debugger

    //AppPlay.name = `SAGE-${playData.id}`
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
    app = createApp(AppPlay).use(vuetify).use(pinia)
    //
  } else if (mode == "test") {
    // ------------------------------
    // Play Mode
    // ------------------------------
    console.log(">>> Test mode!")

    // Expose to JavaScript/Browser console
    window.SAGE = SAGE

    AppPlay.name = "SAGE-Test"
    // Just init basic (non-persisted) Pinia
    const pinia = createPinia()
    app = createApp(AppPlay).use(vuetify).use(pinia)
    //
  } else {
    // ------------------------------
    // Edit Mode
    // ------------------------------
    console.log(">>> Editor mode!")

    AppEdit.name = "SAGE-Edit"
    // This force IndexedDB as the driver
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "sageEdit",
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
    app = createApp(AppEdit).use(vuetify).use(pinia)
  }
}

const importPlayData = async (): Promise<void> => {
  //if (mode == "release") {
  console.log(">>> Import release data?")
  const response = await fetch("/sageData.json")
  sagePlayData = await response.json()
  if (sagePlayData.id) {
    mode = "release"
  }
  console.log(">>> (finished importing release data)")

  if (mode == "test") {
    // --------------------------------
    //Restore test data?
    // --------------------------------
    console.log(">>> Import test data?")
    // Check for data to load
    if (window.opener.sagePlayData) {
      sagePlayData = window.opener.sagePlayData
      console.log(">>> (finished loading test data)")
      //
    }
  }

  storePlayData(sagePlayData)

  loadFonts()

  // Finally, mount the app
  console.log(">>> Mounting #app...")
  app.mount("#app")
}

// prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})

importPlayData()
initStore()
