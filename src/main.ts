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
import { usePlayerStore, type PlayerState } from "./stores/PlayerStore"

let app: App

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const mode = urlParams.get("mode")

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

// v4 ----------------------------------------------------------------
// Same as v3 but with separate (non-persisted) storage for play
// -------------------------------------------------------------------
// // ------------------------------
// // Play Mode
// // ------------------------------
// if (mode == "play") {
//   console.log(">>> Play/Test mode!")

//   // Expose to JavaScript/Browser console
//   window.SAGE = SAGE

//   AppPlay.name = "SAGE-Play"
//   // Just init basic (non-persisted) Pinia
//   const pinia = createPinia()
//   app = createApp(AppPlay).use(vuetify).use(pinia)
//   //
// } else {
//   // ------------------------------
//   // Edit Mode
//   // ------------------------------
//   console.log(">>> Editor mode!")
//   AppEdit.name = "SAGE-Edit"
//   // This force IndexedDB as the driver
//   localforage.config({
//     driver: localforage.INDEXEDDB,
//     name: "sageEdit",
//   })
//   // Create pinia with persisted (indexedDB) storage
//   const pinia = createPinia()
//   pinia.use(
//     createPersistedStatePlugin({
//       storage: {
//         getItem: async (key) => {
//           return localforage.getItem(key)
//         },
//         setItem: async (key, value) => {
//           return localforage.setItem(key, value)
//         },
//         removeItem: async (key) => {
//           return localforage.removeItem(key)
//         },
//       },
//     })
//   )
//   app = createApp(AppEdit).use(vuetify).use(pinia)
// }

// v5 ----------------------------------------------------------------
// Same as v4, but using it for play state also 
// (cloning "edit" store to "play" store before play starts)
// -------------------------------------------------------------------
// ------------------------------
// Play Mode
// ------------------------------
if (mode == "play") {
  console.log(">>> Play/Test mode!")

  // Expose to JavaScript/Browser console
  window.SAGE = SAGE

  AppPlay.name = "SAGE-Play"
  // This force IndexedDB as the driver
  localforage.config({
    driver: localforage.INDEXEDDB,
    name: "sagePlay",
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

// createApp(App).use(vuetify).use(pinia).mount("#app")

//Restore play data?
if (mode == "play") {
  //let app = createApp(AppServer);
  console.log(">>> Load data?")

  const worldStore = useWorldStore()
  const propStore = usePropStore()
  const sceneStore = useSceneStore()
  const doorStore = useDoorStore()
  const actorStore = useActorStore()
  const playerStore = usePlayerStore()

  // Check for data to load
  if (window.opener.sagePlayData) {
    const sagePlayData = window.opener.sagePlayData

    // Only proceed once ALL stores have fully loaded
    // (takes longer with IndexedDB)
    Promise.all([
      worldStore.$persistedState.isReady(),
      sceneStore.$persistedState.isReady(),
      propStore.$persistedState.isReady(),
      doorStore.$persistedState.isReady(),
      actorStore.$persistedState.isReady(),
      playerStore.$persistedState.isReady(),
    ]).then(() => {
      console.log("All stores hydrated pt.1, now overwrite state")

       // World Data
      const worldData: WorldState = JSON.parse(sagePlayData.worldData)
      worldStore.$state = worldData

      // Scene Data
      const sceneData: SceneState = JSON.parse(sagePlayData.sceneData)
      sceneStore.$state = sceneData

      // Prop Data
      const propData: PropState = JSON.parse(sagePlayData.propData)
      propStore.$state = propData

      // Door Data
      const doorData: DoorState = JSON.parse(sagePlayData.doorData)
      doorStore.$state = doorData

      // Actor Data
      // const actorData: ActorState = JSON.parse(sagePlayData.actorData)
      // actorStore.$state = actorData
    })

    // // World Data
    // const worldStore = useWorldStore()
    // const worldData: WorldState = JSON.parse(sagePlayData.worldData)
    // worldStore.$state = worldData

    // // Scene Data
    // const sceneStore = useSceneStore()
    // const sceneData: SceneState = JSON.parse(sagePlayData.sceneData)
    // sceneStore.$state = sceneData

    // // Prop Data
    // const propStore = usePropStore()
    // const propData: PropState = JSON.parse(sagePlayData.propData)
    // propStore.$state = propData

    // // Door Data
    // const doorStore = useDoorStore()
    // const doorData: DoorState = JSON.parse(sagePlayData.doorData)
    // doorStore.$state = doorData

    // // Actor Data
    // const actorStore = useActorStore()
    // const actorData: ActorState = JSON.parse(sagePlayData.actorData)
    // actorStore.$state = actorData

    // DONT reset player/save store on each "play"
    // Player Data
    //const playerStore = usePlayerStore()
    // const playerData: PlayerState = JSON.parse(sagePlayData.playerData)
    // playerStore.$state = playerData

    // debugger
  }

  console.log(">>> (finished loading data)")
}

loadFonts()

// Finally, mount the app
console.log(">>> Mounting #app...")
app.mount("#app")

// prevent right click contextBox
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
})
