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

let app: App

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let mode = urlParams.get("mode")
//if (mode === undefined) {
//let mode = releaseMode === undefined ? urlParams.get("mode") : releaseMode
//}

// Try reading release data...
try {
  const response = await fetch("/sageData.json")
  const sageData = await response.json()
  if (sageData) {
    mode = "release"
    debugger
  }
} catch {
  // ignore, must not be in release mode
}

if (mode === "release") {
  // ------------------------------
  // Release Mode
  // ------------------------------
  console.log(">>> Release mode!")

  // Expose to JavaScript/Browser console
  window.SAGE = SAGE

  AppPlay.name = `SAGE-${sageData.id}`
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

// v1 ----------------------------------------------------------------
// Pinia initialisation with localStorage
// -------------------------------------------------------------------
//const pinia = createPinia().use(piniaPluginPersistedstate)

// v2 ----------------------------------------------------------------
// Pinia with localForage manual pinia plugin
// -------------------------------------------------------------------
// Optional
// localForage.config({
//   driver: localForage.INDEXEDDB, // This force IndexedDB as the driver
// })
// async function indexDbPlugin({ store }: { store: Store }) {
//   const stored = await localForage.getItem(store.$id + "-state")
//   if (stored) {
//     store.$patch(stored)
//   }
//   store.$subscribe(() => {
//     localForage.setItem(store.$id + "-state", { ...store.$state }) // Destructure to transform to plain object
//   })
// }
// const pinia = createPinia().use(indexDbPlugin)

// v3 ----------------------------------------------------------------
// Pinia with pinia-plugin-persistedstate-2 using localforage storage
// -------------------------------------------------------------------
// Now use localforage (forcing IndexedDB)
// localforage.config({
//   driver: localforage.INDEXEDDB, // This force IndexedDB as the driver
//   name: "sageEdit",
// })
// const pinia = createPinia()
// pinia.use(
//   createPersistedStatePlugin({
//     storage: {
//       getItem: async (key) => {
//         console.log(`start getItem(${key})`)
//         return localforage.getItem(key)
//       },
//       setItem: async (key, value) => {
//         return localforage.setItem(key, value)
//       },
//       removeItem: async (key) => {
//         return localforage.removeItem(key)
//       },
//     },
//   })
// )

// createApp(App).use(vuetify).use(pinia).mount("#app")

if (mode == "test") {
  // --------------------------------
  //Restore test data?
  // --------------------------------
  //let app = createApp(AppServer);
  console.log(">>> Load test data?")
  // Check for data to load
  if (window.opener.sagePlayData) {
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
  }
  console.log(">>> (finished loading test data)")
  //
} else if (mode == "play") {
  // --------------------------------
  // Restore exported game data
  // --------------------------------
}

loadFonts()

// Finally, mount the app
console.log(">>> Mounting #app...")
app.mount("#app")

// prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})
