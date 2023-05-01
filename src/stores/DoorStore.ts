import type { DoorModel } from "@/models/DoorModel"
import { defineStore } from "pinia"
import { useWorldStore } from "./WorldStore"

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
    createDoor(door: DoorModel) {
      this.doors.push(door)
    },

    findDoorBySceneId(scene_id: string) {
      return this.doors.filter((door) => door.location_id === scene_id)
    },

    deleteDoor(doorId: string) {
      const index = this.doors.findIndex((item) => item.id === doorId)
      if (index === -1) return
      // Delete door
      this.doors.splice(index, 1)
      // Clear selection (if applicable)
      if (useWorldStore().currDoorId === doorId) {
        useWorldStore().currDoorId = ""
      }
    },
  },

  //persist: true, // Save to localStorage
})
