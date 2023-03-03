import type { PropModel } from "@/models/PropModel"
import { defineStore } from "pinia"

export interface PropState {
  props: PropModel[]
}

export const usePropStore = defineStore({
  id: "propStore",

  state: (): PropState => ({
    props: [],
  }),

  getters: {
    // getCurrentScene(state) {
    //   return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

  actions: {
    // load() {
    //   this.name = "Bridge123"
    // },
  },

  persist: true, // Save to localStorage
})
