import type { Serialization } from "../utils/Serialization"
import * as PropData from "./PropData"
import * as DoorData from "./DoorData"

export class SceneData implements ISceneData, Serialization<SceneData> {
  public constructor() {
    // Anything?
  }

  public id = ""
  public image = ""
  public name = ""
  public sound = ""
  public firstVisit = true
  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {}

  // Events
  public on_enter = ""
  public on_exit = ""

  public props: Array<PropData.PropData> = []
  public doors: Array<DoorData.DoorData> = []

  //screen!: SceneScreen;

  // public initialize(): void {
  //     // Anything?
  // }

  fromJSON(input: ISceneData) {
    this.id = input.id
    this.image = input.image || ""
    this.name = input.name
    this.sound = input.sound
    if (input.firstVisit) this.firstVisit = input.firstVisit
    if (input.property) this.property = input.property
    this.on_enter = input.on_enter
    this.on_exit = input.on_exit
    for (const prop of input.props) {
      this.props.push(new PropData.PropData().fromJSON(prop))
    }
    for (const door of input.doors) {
      this.doors.push(new DoorData.DoorData().fromJSON(door))
    }
    return this
  }

  toJSON(): ISceneData {
    // exclude certain properties from serialisation
    return {
      id: this.id,
      image: this.image,
      sound: this.sound,
      name: this.name,
      firstVisit: this.firstVisit,
      property: this.property,
      on_enter: this.on_enter,
      on_exit: this.on_exit,
      props: this.props,
      doors: this.doors,
    }
  }
}

export interface ISceneData {
  id: string
  image: string
  name: string
  sound: string
  firstVisit: boolean
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_enter: string
  on_exit: string
  props: Array<PropData.IPropData>
  doors: Array<DoorData.IDoorData>
}
