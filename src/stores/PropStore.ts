import type { PropModel } from "@/models/PropModel"
import { defineStore } from "pinia"
import { useWorldStore } from "./WorldStore"

export interface PropState {
  props: PropModel[]
}

export const usePropStore = defineStore({
  id: "propStore",

  state: (): PropState => ({
    props: [],
  }),

  getters: {
    getProps(): PropModel[] {
      return this.props
    },
    // getCurrentScene(state) {
    //   return state.scenes.find((item) => item.id === state.currSceneId)
    // },
  },

  actions: {
    createProp(prop: PropModel) {
      this.props.push(prop)
    },

    findPropBySceneId(scene_id: string) {
      return this.props.filter((prop) => prop.location_id === scene_id)
    },

    deleteProp(propId: string) {
      const index = this.props.findIndex((item) => item.id === propId)
      if (index === -1) return
      // Delete prop
      this.props.splice(index, 1)
      // Clear selection (if applicable)
      if (useWorldStore().currPropId === propId) {
        useWorldStore().currPropId = ""
      }
    },
  },

  //persist: true, // Save to localStorage
})
