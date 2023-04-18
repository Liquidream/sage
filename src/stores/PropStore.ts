import type { PropModel } from "@/models/PropModel"
import { defineStore } from "pinia"

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
    // load() {
    //   this.name = "Bridge123"
    // },
    findPropBySceneId(scene_id: string) {
      return this.props.filter((prop) => prop.location_id === scene_id)
    },
  },

  //persist: true, // Save to localStorage
})
