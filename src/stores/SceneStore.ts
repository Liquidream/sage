import type { SceneModel } from "@/models/SceneModel"
import { defineStore } from "pinia"

export interface SceneState {
  scenes: SceneModel[]
}

export const useSceneStore = defineStore({
  id: "sceneStore",

  state: (): SceneState => ({
    scenes: [],
  }),

  getters: {
    // getProps(scene_id: string) {
    //   const propStore = usePropStore()
    //   return propStore.props.find((item) => item.location_id === scene_id)
    //   //return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

  actions: {
    // load() {
    //   this.name = "Bridge123"
    // },
  },

  //persist: true, // Save to localStorage
})
