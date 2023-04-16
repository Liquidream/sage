import type { Serialization } from "../utils/Serialization"
import * as Player from "./Player"
import * as Scene from "./Scene"
import type { PropData } from "./data/PropData"
import { SAGE } from "./SAGEPlay"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneModel } from "@/models/SceneModel"

export class World implements IWorldData { //}, Serialization<World> {
  public constructor() {
    // Anything?
  }

  private worldStore = useWorldStore()

  public get title(): string | undefined {
    return this.worldStore.title
  }
  // public title: string | undefined

  public get scenes(): SceneModel[] {
    return this.worldStore.getScenes
  }
  // public scenes: Array<Scene.Scene> = []

  public get startingSceneId(): string | undefined {
    return this.worldStore.startingSceneId
  }
  // public starting_scene_id: string | undefined
  // Events
  public on_start = ""
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean } = {}

  public currentScene!: Scene.Scene

  public player!: Player.Player

  public initialize(data: IWorldData): void {
    // (Done in gamedata - else can't define hidden props)
    // Create the first scene as "void"?
    // let voidScene = Object.assign( new Scene(), {
    //     id: "scn_void",
    //     name: "The Void"
    // });
    // this.scenes.push(voidScene)

    // Now restore the rest from data
    //this.fromJSON(data)

    this.player = new Player.Player() //.fromJSON(input.player)
  }

  // Start the adventure!
  start() {
    // Run any on_start action?
    if (this.on_start) {
      SAGE.Script.safeExecFunc(this.on_start)
    }

    // Find the starting scene...
    const startingSceneData = this.scenes.find((obj) => {
      return obj.id === this.startingSceneId
    })

    // ...and show it
    if (startingSceneData) {
      const startingScene = new Scene.Scene(startingSceneData)
      startingScene.show()
    } else {
      SAGE.Dialog.showErrorMessage(
        `Error: Scene with ID '${this.startingSceneId}' is invalid`
      )
    }
  }

  stop() {
    if (this.currentScene) {
      this.currentScene.screen.tidyUp(true)
    }
  }

  /** Find and return scene with specific id */
  getSceneById(sceneId: string) {
    // Find the specified scene...
    const scene = this.scenes.find((obj) => {
      return obj.id === sceneId
    })
    return scene
  }

  /** Find and return prop with specific id */
  getPropById(propId: string) {
    // First, find scene that contains prop...
    const scene = this.scenes.filter(
      (e) => e.props.filter((c) => c.id === propId)[0]
    )[0]
    // Then get the propdata...
    const propData = scene
      ? scene.props.filter((c) => c.id === propId)[0]
      : null
    return propData
  }

  // ### REMOVED for now - as perhaps should move to Void instead? (once gone, can't come back)
  // destroyProp(propId: string) {
  //   const prop = this.getPropById(propId);
  //   // Check for prop in inventory
  //   if (SAGE.World.player.hasPropInInventory(propId)) {
  //     SAGE.World.player.removeFromInventory(propId)
  //   }
  // }

  /** Move prop to specfied scene id (at optional x,y position)  */
  revealPropAt(propId: string, targetSceneId: string) {
    this.putPropAt(propId, targetSceneId, undefined, undefined, true)
  }

  /** Move prop to specfied scene id (at optional x,y position)  */
  putPropAt(
    propId: string,
    targetSceneId: string,
    x?: number,
    y?: number,
    fadeIn?: boolean
  ) {
    // Get prop data
    const propData = this.getPropById(propId)
    if (propData) {
      // Remove prop from its current scene...
      const sourceScene = this.scenes.find((scn) => {
        return scn.props.find((prp: PropData) => {
          return prp.id === propId
        })
      })
      if (sourceScene) {
        sourceScene.removePropDataById(propId)
      }

      // ..and place in target scene...
      const targetScene = this.getSceneById(targetSceneId)
      if (targetScene) {
        // data...
        targetScene.addPropData(propData)
        //targetScene.props.push(propData);

        // sprite... (if scene is active)
        if (targetScene === this.currentScene && sourceScene != targetScene) {
          this.currentScene.screen.addProp(propData, fadeIn)
        }
      }
      // (optionally, at position)
      if (x) propData.x = x
      if (y) propData.y = y
    }
  }

  // ----------------------------------------------------------
  // Serialisation related

  // fromJSON(input: IWorldData) {
  //   //this.title = input.title
  //   if (input.property) this.property = input.property
  //   // for (const scene of input.scenes) {
  //   //   this.scenes.push(new Scene.Scene().fromJSON(scene))
  //   // }
  //   this.player = new Player.Player().fromJSON(input.player)
  //   //this.starting_scene_id = input.starting_scene_id
  //   this.on_start = input.on_start
  //   return this
  // }

  // toJSON(): IWorldData {
  //   return {
  //     title: this.title,
  //     property: this.property,
  //     // scenes: this.scenes,
  //     startingSceneId: this.startingSceneId,
  //     on_start: this.on_start,
  //     player: this.player,
  //   }
  // }

  // serialize(): string {
  //   return JSON.stringify(this) //, replacer());
  // }
}

export interface IWorldData {
  title: string | undefined
  player: Player.IPlayerData
  scenes: SceneModel[] //Array<Scene.ISceneData>
  startingSceneId: string | undefined
  on_start: string
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean }
  // Poss. event actions
  //on_enter: string;
}
