import type { PropModel } from "@/models/PropModel"
import { defineStore } from "pinia"

export interface PlayerState {
  inventory: PropModel[]
}

export const usePlayerStore = defineStore({
  id: "playerStore",

  state: (): PlayerState => ({
    inventory: [],
  }),

  // getters: {
  //   // getCurrentScene(state) {
  //   //   return state.scenes.find((item) => item.id === state.currSceneId)
  //   // },
  // },

  // actions: {
  //   // load() {
  //   //   this.name = "Bridge123"
  //   // },
  // },

  //persist: true, // Save to localStorage
})
