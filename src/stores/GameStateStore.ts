import type { SaveStateModel } from "@/models/SaveStateModel"
import { defineStore } from "pinia"

export interface GameState {
  //inventory: PropModel[]
  // ink-related
  //storyState: string // Current save state
  saveState: SaveStateModel // 
}

export const useGameStateStore = defineStore({
  id: "gameStateStore",

  state: (): GameState => ({
    //storyState: "",
    saveState: { piniaStates: "", inkStoryState: "" },
    //inventory: [],
  }),
})
