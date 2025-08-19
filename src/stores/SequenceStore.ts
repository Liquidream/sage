import type { SequenceModel } from "@/models/SequenceModel"
import { defineStore } from "pinia"
import { useSceneStore } from "./SceneStore"

export interface SequenceState {
  sequences: SequenceModel[]
}

export const useSequenceStore = defineStore("sequenceStore", {

  state: (): SequenceState => ({
    sequences: [],
  }),

  getters: {
    // getProps(scene_id: string) {
    //   const propStore = usePropStore()
    //   return propStore.props.find((item) => item.location_id === scene_id)
    //   //return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

  actions: {

    findSequenceBySceneId(scene_id: string) {
      //debugger
      const scene = useSceneStore().scenes.find((scene) => scene.id === scene_id)
      if (scene) {
        const sequence = this.sequences.find((seq) => seq.id === scene.sequence_id)
        return sequence 
      }
    },

  },

  //persist: true, // Save to localStorage
})
