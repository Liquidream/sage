import { SAGE } from "./SAGEPlay"
import { SceneScreen } from "./screens/SceneScreen"
//import type { Serialization } from "../utils/Serialization"
//import * as PropData from "./data/PropData"
import * as DoorData from "./data/DoorData"
import type { SceneModel } from "@/models/SceneModel"
import type { PropModel } from "@/models/PropModel"
import { usePropStore } from "@/stores/PropStore"

export class Scene implements SceneModel {
  //implements ISceneData, Serialization<Scene> {
  // public constructor() {
  //   // Anything?
  // }

  public constructor(inModel: SceneModel) {
    this.sceneModel = inModel
  }

  private sceneModel: SceneModel

  // public id = ""
  public get id(): string {
    return this.sceneModel.id
  }
  // public name = ""
  public get name(): string {
    return this.sceneModel.name
  }
  //public image = ""
  public get image(): string | undefined {
    return this.sceneModel.image
  }
  // public sound = ""
  public get sound(): string | undefined {
    return this.sceneModel.sound
  }
  // public firstVisit = true
  public get firstVisit(): boolean | undefined {
    return this.sceneModel.firstVisit
  }
  public set firstVisit(value: boolean | undefined) {
    this.sceneModel.firstVisit = value
  }

  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {}

  // Events
  public on_enter = ""
  public on_exit = ""

  //public props: Array<PropData.PropData> = []
  //public props: Array<PropModel> = []
  public get props(): Array<PropModel> {
    const propStore = usePropStore()
    return propStore.findPropBySceneId(this.id)
  }

  public doors: Array<DoorData.DoorData> = []

  screen!: SceneScreen

  // public initialize(): void {
  //     // Anything?
  // }

  /**
   * Create scene and change display to it
   *
   * (also destroy/release previous screen objects)
   */
  show(skipFade = false) {
    console.log("in Scene.show()...")
    // Teardown current scene
    SAGE.World.currentScene?.teardown()
    // Clean up current scene "screen"
    SAGE.World.currentScene?.screen.tidyUp()
    // Create and switch to new "screen"
    this.screen = new SceneScreen(this)

    if (!skipFade) {
      SAGE.changeScreenFade(this.screen)
    } else {
      SAGE.changeScreen(this.screen)
    }

    // Remember the new scene
    // (happens in above function)
    SAGE.World.currentScene = this
    //SAGE.World.startingSceneId = this.id

    // DEBUG
    //console.log(SAGE.World.serialize());

    // Run any OnEnter action?
    if (this.on_enter) {
      SAGE.Script.safeExecFunc(this.on_enter)
    }
  }

  teardown() {
    // Run any OnEnter action?
    if (this.on_exit) {
      SAGE.Script.safeExecFunc(this.on_exit)
    }
    if (this.firstVisit) this.firstVisit = false
  }

  addPropModel(propModel: PropModel) {
    // add to list of props
    this.props.push(propModel)
  }

  removePropDataById(propId: string) {
    // Remove data from prop list (no DisplayObject changes)
    const index = this.props.findIndex((item) => item.id === propId)
    if (index !== -1) this.props.splice(index, 1)
  }

  // fromJSON(input: ISceneData) {
  //   this.id = input.id
  //   this.image = input.image || ""
  //   this.name = input.name
  //   this.sound = input.sound
  //   if (input.firstVisit) this.firstVisit = input.firstVisit
  //   if (input.property) this.property = input.property
  //   this.on_enter = input.on_enter
  //   this.on_exit = input.on_exit
  //   for (const prop of input.props) {
  //     this.props.push(new PropData.PropData().fromJSON(prop))
  //   }
  //   for (const door of input.doors) {
  //     this.doors.push(new DoorData.DoorData().fromJSON(door))
  //   }
  //   return this
  // }

  // toJSON(): ISceneData {
  //   // exclude certain properties from serialisation
  //   return {
  //     id: this.id,
  //     image: this.image,
  //     sound: this.sound,
  //     name: this.name,
  //     firstVisit: this.firstVisit,
  //     property: this.property,
  //     on_enter: this.on_enter,
  //     on_exit: this.on_exit,
  //     props: this.props,
  //     doors: this.doors,
  //   }
  // }
}

// export interface ISceneData {
//   id: string
//   image: string | undefined
//   name: string
//   sound: string
//   firstVisit: boolean
//   // Key-Value pair to allow properties to be set/read
//   property: { [key: string]: string | number | boolean }
//   // Poss. event actions
//   on_enter: string
//   on_exit: string
//   props: Array<PropData.IPropData>
//   doors: Array<DoorData.IDoorData>
// }
