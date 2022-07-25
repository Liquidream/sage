import type { SceneModel } from "@/models/SceneModel"
import { defineStore } from "pinia"

export type RootState = {
  title: string
  scenes: SceneModel[]
  on_start: string
  currSceneId: string
}

export const useWorldStore = defineStore({
  id: "sageStore",
  // Recommendation not to use "as"
  // https://dev.to/cefn/comment/1m25c
  state: (): RootState => ({
    title: "",
    scenes: [],
    on_start: "",
    currSceneId: "",
  }),

  getters: {
    getCurrentScene(state) {
      return state.scenes.find((item) => item.id === state.currSceneId)
    },
  },

  actions: {
    createScene(scene: SceneModel) {
      this.scenes.push(scene)
    },

    updateScene(id: string, payload: SceneModel) {
      if (!id || !payload) return

      const index = this.findIndexById(id)

      if (index !== -1) {
        this.scenes[index] = payload
      }
    },

    deleteScene(id: string) {
      const index = this.findIndexById(id)

      if (index === -1) return

      this.scenes.splice(index, 1)
    },

    findIndexById(id: string) {
      return this.scenes.findIndex((item) => item.id === id)
    },

    resetToDemoData() {
      this.scenes = [
        {
          id: "scnBridge",
          name: "Bridge",
        },
        {
          id: "scnCave",
          name: "Cave Entrance...",
        },
        {
          id: "scnFort",
          name: "Fortress",
        },
      ]
    },
  },

  persist: true, // Save to localStorage
})
