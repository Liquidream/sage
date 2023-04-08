import type { ActorModel } from "@/models/ActorModel"
import { defineStore } from "pinia"

export interface ActorState {
  actors: ActorModel[]
}

export const useActorStore = defineStore({
  id: "actorStore",

  state: (): ActorState => ({
    actors: [],
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
