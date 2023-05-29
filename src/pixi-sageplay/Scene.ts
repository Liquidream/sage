import { SAGE } from "./SAGEPlay"
import { SceneScreen } from "./screens/SceneScreen"
//import type { Serialization } from "../utils/Serialization"
//import * as PropData from "./data/PropData"
//import * as DoorData from "./data/DoorData"
import type { SceneModel } from "@/models/SceneModel"
import type { PropModel } from "@/models/PropModel"
import { usePropStore } from "@/stores/PropStore"
import type { DoorModel } from "@/models/DoorModel"
import { useDoorStore } from "@/stores/DoorStore"
import { useWorldStore } from "@/stores/WorldStore"
import type { ActorModel } from "@/models/ActorModel"
import { useActorStore } from "@/stores/ActorStore"

export class Scene implements SceneModel {
  //implements ISceneData, Serialization<Scene> {
  // public constructor() {
  //   // Anything?
  // }

  public constructor(inModel: SceneModel) {
    this.sceneModel = inModel
  }

  private sceneModel: SceneModel
  private screen!: SceneScreen

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
  // public on_enter = ""
  public get on_enter(): string | undefined {
    return this.sceneModel.on_enter
  }
  // public on_exit = ""
  public get on_exit(): string | undefined {
    return this.sceneModel.on_exit
  }

  //public props: Array<PropData.PropData> = []
  //public props: Array<PropModel> = []
  public get props(): Array<PropModel> {
    const propStore = usePropStore()
    return propStore.findPropBySceneId(this.id)
  }

  //public doors: Array<DoorData.DoorData> = []
  public get doors(): Array<DoorModel> {
    const doorStore = useDoorStore()
    return doorStore.findDoorBySceneId(this.id)
  }

  //public doors: Array<DoorData.DoorData> = []
  public get actors(): Array<ActorModel> {
    const actorStore = useActorStore()
    return actorStore.findActorBySceneId(this.id)
  }

  public setDepthOfField(isEnabled: boolean) {
    this.screen.setDepthOfField(isEnabled)
  }

  public closeUpOn(objectName: string) {
    //debugger
    // try actor first
    const actorModel = SAGE.World.getActorById(objectName)
    if (actorModel !== undefined) {
      this.screen.setDepthOfField(true)
      this.screen.addActorCloseup(actorModel, true)
      return
    }
    // ok, try Prop then
    const propModel = SAGE.World.getPropById(objectName)
    if (propModel !== undefined) {
      this.screen.setDepthOfField(true)
      this.screen.addPropCloseup(propModel, true)
      return
    } 
    //If got here, then didn't find something...    
    SAGE.Dialog.showErrorMessage(`No actor or prop found with id: ${objectName}`)
  }
  

  public stopCloseUp(objectName: string) {
    // try actor first
    const actorModel = SAGE.World.getActorById(objectName)
    if (actorModel !== undefined) {
      const actor = this.screen.actorsCloseups.filter((a) => a.model.id === actorModel.id)[0]
      this.screen.removeActorCloseup(actor, true)
    }
    // ok, try Prop then
    const propModel = SAGE.World.getPropById(objectName)
    if (propModel !== undefined) {
      const prop = this.screen.propsCloseups.filter((p) => p.model.id === propModel.id)[0]
      this.screen.removePropCloseup(prop, true)
    }
    // If last close-up object, then auto-reset depth of field
    if (
      this.screen.actorsCloseups.length === 0 &&
      this.screen.propsCloseups.length == 0
    ) {
        this.screen.setDepthOfField(false)
      }
  }

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
    // (remembers by changing the starting scene)
    const worldStore = useWorldStore()
    worldStore.startingSceneId = this.id
    worldStore.currSceneId = this.id

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

  removePropModelById(propId: string) {
    // Remove data from prop list (no DisplayObject changes)
    const index = this.props.findIndex((item) => item.id === propId)
    if (index !== -1) this.props.splice(index, 1)
  }

  removeActorModelById(actorId: string) {
    // Remove data from actor list (no DisplayObject changes)
    const index = this.actors.findIndex((item) => item.id === actorId)
    if (index !== -1) this.actors.splice(index, 1)
  }
}
