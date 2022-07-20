import { defineStore } from "pinia"

export const useSceneStore = defineStore({
  id: "SceneStore",

  state: () => ({
    name: "<unset>",
  }),

  actions: {
    load() {
      this.name = "Bridge"
    },
  },

  // getters: {
  //   doubleCount: (state) => state.counter * 2,
  // },

  persist: true,
})
