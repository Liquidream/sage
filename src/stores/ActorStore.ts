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

  actions: {
    createActor(prop: ActorModel) {
      this.actors.push(prop)
    },

    findActorBySceneId(scene_id: string) {
      return this.actors.filter((actor) => actor.location_id === scene_id)
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
