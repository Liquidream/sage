import type { SceneModel } from "@/models/SceneModel"
import { defineStore } from "pinia"
import { useActorStore } from "./ActorStore"

export interface SceneState {
  scenes: SceneModel[]
}

export const useSceneStore = defineStore("sceneStore", {

  state: (): SceneState => ({
    scenes: [],
  }),

  getters: {
    // getProps(scene_id: string) {
    //   const propStore = usePropStore()
    //   return propStore.props.find((item) => item.location_id === scene_id)
    //   //return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

   actions: {

    findSceneBySequenceId(sequence_id: string) {
      return this.scenes.filter((scene) => scene.sequence_id === sequence_id)
    },

  },

  

  //persist: true, // Save to localStorage
})
