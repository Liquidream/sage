import type { SceneModel } from "@/models/SceneModel"
import { defineStore } from "pinia"
import { useActorStore } from "./ActorStore"

export interface SceneState {
  scenes: SceneModel[]
}

export const useSceneStore = defineStore({
  id: "sceneStore",

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

  // actions: {
  //   // TODO: Think a publish/subscribe approach would be "better" here
  //   //       (let stores clean up their own data) but need this all to happen NOW!
  //   //       ..or else screen will re-initialise with half-baked edits
  //   realignChildObjects(oldSceneId: string, newSceneId: string) {
  //     console.log(`sceneStore::realignChildObjects (Old id = ${oldSceneId}, New id = ${newSceneId})`)
  //     // Actors
  //     const sceneActorModels = useActorStore().findActorBySceneId(oldSceneId)
  //     if (sceneActorModels.length > 0) {
  //       for (const actorModel of sceneActorModels) {
  //         actorModel.location_id = newSceneId
  //       }
  //     }
  //   },
  // },

  //persist: true, // Save to localStorage
})
