import { Constants } from "@/constants"
import { defineStore } from "pinia"

export interface SageEditState {
  version: string // "1.0"
  id: string      // "kingsRansom"
  //
  worldData: string
  sceneData: string
  propData: string
  doorData: string
  actorData: string
}

export const useSageEditStore = defineStore({
  id: "sageEditStore",

  state: (): SageEditState => ({
    version: Constants.APP_VERSION,
    id: "",
    //
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

  //persist: true, // Save to localStorage
})
