import type { SceneModel } from "@/models/SceneModel"
import { useSceneStore } from "@/stores/SceneStore"
import { defineStore } from "pinia"
import { usePropStore } from "./PropStore"

export interface WorldState {
  title: string
  //scenes: SceneModel[]
  on_start: string
  currSceneId: string
}

export const useWorldStore = defineStore({
  id: "worldStore",
  //sceneStore: useSceneStore(),
  // Recommendation not to use "as"
  // https://dev.to/cefn/comment/1m25c
  // https://runthatline.com/pinia-typescript-type-state-actions-getters/
  // https://pinia.vuejs.org/core-concepts/state.html#typescript
  state: (): WorldState => ({
    title: "",
    //scenes: [],
    on_start: "",
    currSceneId: "",
  }),

  getters: {
    getScenes() {
      const sceneStore = useSceneStore()
      return sceneStore.scenes
    },

    getCurrentScene(state) {
      const sceneStore = useSceneStore()
      return sceneStore.scenes.find((item) => item.id === state.currSceneId)
    },
  },

  actions: {
    /* ----------------------------------------------------------
     * Scenes
     */
    createScene(scene: SceneModel) {
      const sceneStore = useSceneStore()
      sceneStore.scenes.push(scene)
    },

    updateScene(id: string, payload: SceneModel) {
      if (!id || !payload) return

      const index = this.findIndexById(id)

      if (index !== -1) {
        const sceneStore = useSceneStore()
        sceneStore.scenes[index] = payload
      }
    },

    deleteScene(id: string) {
      const index = this.findIndexById(id)

      if (index === -1) return

      const sceneStore = useSceneStore()
      sceneStore.scenes.splice(index, 1)
    },

    findIndexById(id: string) {
      const sceneStore = useSceneStore()
      return sceneStore.scenes.findIndex((item) => item.id === id)
    },

    /* ----------------------------------------------------------
     * Props
     * (Think these shout be in own store, but want to keep neat hierarchy)
     */

    /* ----------------------------------------------------------
     * Doors
     * (Think these shout be in own store, but want to keep neat hierarchy)
     */

    /* ----------------------------------------------------------
     * Other
     */
    // This should prob be in another file?
    resetToDemoData() {
      // Default scenes
      const sceneStore = useSceneStore()
      sceneStore.scenes = [
        {
          id: "scnBridge",
          name: "Bridge",
        },
        {
          id: "scnCave",
          name: "Cave Entrance",
        },
        {
          id: "scnFort",
          name: "Fortress",
        },
      ]
      // Default props
      const propStore = usePropStore()
      propStore.props = [
        {
          name: "Old Lamp",
          id: "prp1",
        },
        {
          name: "Silver Key",
          id: "prp2",
        },
        {
          name: "Gold Bar",
          id: "prp3",
        },
      ]
    },
  },

  persist: true, // Save to localStorage
})
