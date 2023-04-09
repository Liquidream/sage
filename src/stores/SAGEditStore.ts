import { defineStore } from "pinia"

// export interface ActorState {
//   actors: ActorModel[]
// }

export const useSageEditStore = defineStore({
  id: "sageEditStore",

  state: () => ({
    worldData: "",
    sceneData: "",
    propData: "",
    doorData: "",
    actorData: "",
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

  persist: true, // Save to localStorage
})
