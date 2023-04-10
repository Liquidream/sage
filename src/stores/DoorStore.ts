import type { DoorModel } from "@/models/DoorModel"
import { defineStore } from "pinia"

export interface DoorState {
  doors: DoorModel[]
}

export const useDoorStore = defineStore({
  id: "doorStore",

  state: (): DoorState => ({
    doors: [],
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
    findDoorBySceneId(scene_id: string) {
      return this.doors.filter((door) => door.in_scene_id === scene_id)
    },
  },

  //persist: true, // Save to localStorage
})
