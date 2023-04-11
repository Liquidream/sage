import { createApp } from "vue"
import { createPinia } from "pinia"
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2"
import localforage from "localforage"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
// import { SAGEdit } from "./SAGEdit"
// import { useWorldStore, type WorldState } from "./stores/WorldStore"

// current screen size
// const gameWidth = 1920
// const gameHeight = 1080

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const mode = urlParams.get("mode")

// ------------------------------
// Play Mode
// ------------------------------
if (mode == "play") {
  //let app = createApp(AppServer);
  console.log(">>> Play/Test mode!")
  // console.log(`>>> JSON = ${window.S.JSON}`)
  App.name = "SAGE-Play"
  // Just init basic (non-persisted) Pinia
  const pinia = createPinia()
  createApp(App).use(vuetify).use(pinia).mount("#app")
} else {
  // ------------------------------
  // Edit Mode
  // ------------------------------
  //let id = urlParams.get('id')
  //app = createApp(App, { id: parseInt(id) } );
  console.log(">>> Editor mode!")
  // window.S = {}
  // S.JSON = "hello!"
  App.name = "SAGE-Edit"
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
          console.log(`start getItem(${key})`)
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
  createApp(App).use(vuetify).use(pinia).mount("#app")
}

loadFonts()

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

// Restore play data?
// if (mode == "play") {
//   //let app = createApp(AppServer);
//   console.log(">>> Load data?")
//   // Check for data to load
//   // debugger
//   if (window.opener.sagePlayData) {
//     const sagePlayData = window.opener.sagePlayData
//     // World Data
//     const worldStore = useWorldStore()
//     const worldData: WorldState = JSON.parse(sagePlayData.worldData)
//     worldStore.title = worldData.title
//     worldStore.on_start = worldData.on_start
//     worldStore.currSceneId = worldData.currSceneId
//     worldStore.currPropId = worldData.currPropId
//     worldStore.currDoorId = worldData.currDoorId
//   }
// } else {
//   // console.log(">>> Editor mode!")
// }
