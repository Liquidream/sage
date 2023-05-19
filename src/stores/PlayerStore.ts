import type { PropModel } from "@/models/PropModel"
import { defineStore } from "pinia"

export interface PlayerState {
  inventory: PropModel[]
}

export const usePlayerStore = defineStore({
  id: "playerStore",

  state: (): PlayerState => ({
    inventory: [],
  }),

})
