import { DoorState, type DoorModel } from "@/models/DoorModel"
import type { PropModel } from "@/models/PropModel"
import type { SceneModel } from "@/models/SceneModel"
import { useSceneStore } from "@/stores/SceneStore"
import { defineStore } from "pinia"
import { useDoorStore } from "./DoorStore"
import { usePropStore } from "./PropStore"
import { useActorStore } from "./ActorStore"
import type { ActorModel } from "@/models/ActorModel"

export interface WorldState {
  id: string
  title: string
  startingSceneId: string
  on_start: string
  currSceneId: string
  currPropId: string
  currDoorId: string
  currActorId: string
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
}

export const useWorldStore = defineStore("worldStore", {
  // Recommendation NOT to use "as"
  // https://dev.to/cefn/comment/1m25c
  // https://runthatline.com/pinia-typescript-type-state-actions-getters/
  // https://pinia.vuejs.org/core-concepts/state.html#typescript
  state: (): WorldState => ({
    id: "",
    title: "",
    startingSceneId: "",
    on_start: "",
    currSceneId: "",
    currPropId: "",
    currDoorId: "",
    currActorId: "",
  }),

  getters: {
    getScenes(): SceneModel[] {
      const sceneStore = useSceneStore()
      return sceneStore.scenes
    },

    getCurrentScene(state): SceneModel | undefined {
      const sceneStore = useSceneStore()
      return sceneStore.scenes.find((item) => item.id === state.currSceneId)
    },

    getCurrentProp(state): PropModel | undefined {
      const propStore = usePropStore()
      return propStore.props.find((item) => item.id === state.currPropId)
    },

    getCurrentDoor(state): DoorModel | undefined {
      const doorStore = useDoorStore()
      return doorStore.doors.find((item) => item.id === state.currDoorId)
    },

    getActors(): ActorModel[] {
      const actorStore = useActorStore()
      return actorStore.actors
    },

    getCurrentActor(state): ActorModel | undefined {
      const actorStore = useActorStore()
      return actorStore.actors.find((item) => item.id === state.currActorId)
    },
  },

  actions: {
    /* ----------------------------------------------------------
     * Scenes
     */
    createScene(scene: SceneModel) {
      const sceneStore = useSceneStore()
      sceneStore.scenes.push(scene)
    },

    updateScene(id: string, payload: SceneModel) {
      if (!id || !payload) return
      const index = this.findIndexById(id)
      if (index !== -1) {
        const sceneStore = useSceneStore()
        sceneStore.scenes[index] = payload
      }
    },

    deleteScene(id: string) {
      const index = this.findIndexById(id)
      if (index === -1) return
      const sceneStore = useSceneStore()
      sceneStore.scenes.splice(index, 1)
      // Clear selection (if applicable)
      if (this.currSceneId === id) {
        this.currSceneId = ""
      }
    },

    findIndexById(id: string): number {
      const sceneStore = useSceneStore()
      return sceneStore.scenes.findIndex((item) => item.id === id)
    },

    /* ----------------------------------------------------------
     * Props
     * (Think these shout be in own store, but want to keep neat hierarchy)
     */

    /* ----------------------------------------------------------
     * Doors
     * (Think these shout be in own store, but want to keep neat hierarchy)
     */

    /* ----------------------------------------------------------
     * Other
     */

    //persist: true, // Save to localStorage
  },
})
