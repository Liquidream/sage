import type { ActorModel } from "@/models/ActorModel"
import { defineStore } from "pinia"
import { useWorldStore } from "./WorldStore"

export interface ActorState {
  actors: ActorModel[]
}

export const useActorStore = defineStore({
  id: "actorStore",

  state: (): ActorState => ({
    actors: [],
  }),

  getters: {
    getActors(): ActorModel[] {
      return this.actors
    },
    // getCurrentScene(state) {
    //   return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

  actions: {
    createActor(prop: ActorModel) {
      this.actors.push(prop)
    },

    findActorBySceneId(scene_id: string) {
      return this.actors.filter((actor) => actor.location_id === scene_id)
    },

    findActorById(id: string): ActorModel {
      return this.actors.filter((actor) => actor.id === id)[0]
    },

    deleteActor(actorId: string) {
      const index = this.actors.findIndex((item) => item.id === actorId)
      if (index === -1) return
      // Delete actor
      this.actors.splice(index, 1)
      // Clear selection (if applicable)
      if (useWorldStore().currActorId === actorId) {
        useWorldStore().currActorId = ""
      }
    },

    
  },

  //persist: true, // Save to localStorage
})
