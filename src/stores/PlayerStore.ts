import type { PropModel } from "@/models/PropModel"
import type { SaveStateModel } from "@/models/SaveStateModel"
import { defineStore } from "pinia"

export interface PlayerState {
  inventory: PropModel[]
  // ink-related
  gameState: SaveStateModel
}

export const usePlayerStore = defineStore({
  id: "playerStore",

  state: (): PlayerState => ({
    inventory: [],
    gameState: { jsonState: "" },
  }),

})
