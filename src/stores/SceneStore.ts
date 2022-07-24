import { defineStore } from "pinia"

export const useSceneStore = defineStore({
  id: "SceneStore",

  state: () => ({
    scenes: [],
    // Fields
    id: "",
    image: "",
    name: "",
    soundFile: "",
    // Events
    onEnter: "",
    onExit: "",
  }),

  actions: {
    load() {
      this.name = "Bridge"
    },
  },

  // getters: {
  //   doubleCount: (state) => state.counter * 2,
  // },

  persist: true, // Save to localStorage
})
