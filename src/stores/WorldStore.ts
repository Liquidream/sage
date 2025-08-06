import { DoorState, type DoorModel } from "@/models/DoorModel"
import type { PropModel } from "@/models/PropModel"
import type { SceneModel } from "@/models/SceneModel"
import { useSceneStore } from "@/stores/SceneStore"
import { defineStore } from "pinia"
import { useDoorStore } from "./DoorStore"
import { usePropStore } from "./PropStore"
import { useActorStore } from "./ActorStore"
import { useSequenceStore } from "./SequenceStore"
import type { ActorModel } from "@/models/ActorModel"
import type { SequenceModel } from "@/models/SequenceModel"

export interface WorldState {
  id: string
  title: string
  startingSceneId: string
  //on_start: string
  script_functions: string
  script_on_start: string
  currSequenceId: string
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
    //on_start: "",
    script_functions: "",
    script_on_start: "",
    currSequenceId: "",
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

    getProps(): PropModel[] {
      const propStore = usePropStore()
      return propStore.props
    },

    getCurrentProp(state): PropModel | undefined {
      const propStore = usePropStore()
      return propStore.props.find((item) => item.id === state.currPropId)
    },

    getDoors(): PropModel[] {
      const doorStore = useDoorStore()
      return doorStore.doors
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

    getSequences(): SequenceModel[] {
      const sequenceStore = useSequenceStore()
      return sequenceStore.sequences
    },

    getCurrentSequence(state): SequenceModel | undefined {
      const sequenceStore = useSequenceStore()
      return sequenceStore.sequences.find((item) => item.id === state.currSequenceId)
    },
  },

  actions: {
    /* ----------------------------------------------------------
     * Sequences
     */
    createSequence(sequence: SequenceModel) {
      const sequenceStore = useSequenceStore()
      sequenceStore.sequences.push(sequence)
    },

    updateSequence(id: string, payload: SceneModel) {
      if (!id || !payload) return
      const index = this.findSequenceIndexById(id)
      if (index !== -1) {
        const sequenceStore = useSequenceStore()
        sequenceStore.sequences[index] = payload
      }
    },

    deleteSequence(id: string) {
      const index = this.findSequenceIndexById(id)
      if (index === -1) return
      const sequenceStore = useSequenceStore()
      sequenceStore.sequences.splice(index, 1)
      // Clear selection (if applicable)
      if (this.currSceneId === id) {
        this.currSceneId = ""
      }
    },

    findSequenceIndexById(id: string): number {
      const sequenceStore = useSequenceStore()
      return sequenceStore.sequences.findIndex((item) => item.id === id)
    },

    /* ----------------------------------------------------------
     * Scenes
     */
    createScene(scene: SceneModel) {
      const sceneStore = useSceneStore()
      sceneStore.scenes.push(scene)
    },

    updateScene(id: string, payload: SceneModel) {
      if (!id || !payload) return
      const index = this.findSceneIndexById(id)
      if (index !== -1) {
        const sceneStore = useSceneStore()
        sceneStore.scenes[index] = payload
      }
    },

    deleteScene(id: string) {
      const index = this.findSceneIndexById(id)
      if (index === -1) return
      const sceneStore = useSceneStore()
      sceneStore.scenes.splice(index, 1)
      // Clear selection (if applicable)
      if (this.currSceneId === id) {
        this.currSceneId = ""
      }
    },

    findSceneIndexById(id: string): number {
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
