import { SAGE } from "./SAGEPlay"
import type { Serialization } from "../utils/Serialization"
import { Prop } from "./Prop"
//import * as PropData from "./data/PropData"
import type { PropModel } from "@/models/PropModel"

export class Player implements IPlayerData, Serialization<Player> {
  public constructor() {
    // Anything?
  }
  public name: string | undefined
  public inventory: Array<PropModel> = []
  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {}

  /** Returns whether or not the specified prop id is in player's inventory */
  public hasPropInInventory(propId: string): boolean {
    return this.inventory.some((prop) => prop.id === propId)
  }

  /** Remove (and return) the specified prop, if present */
  public addToInventory(propData: PropModel) {
    SAGE.World.player.inventory.push(propData)
    SAGE.invScreen.addProp(new Prop(propData))
  }

  /** Remove (and return) the specified prop, if present */
  public removeFromInventory(propId: string): PropModel | undefined {
    const index = this.inventory.findIndex((item) => item.id === propId)
    let propData
    if (index !== -1) propData = this.inventory.splice(index, 1)
    //const propData = this.inventory.splice(this.inventory.findIndex(item => item.id === propId), 1);
    const prop = SAGE.invScreen.removeProp(propId)
    prop?.destroy()
    if (propData) return propData[0]
    return
  }

  fromJSON(input: IPlayerData) {
    this.name = input.name
    if (input.property) this.property = input.property
    for (const prop of input.inventory) {
      this.inventory.push(prop)
      // this.inventory.push(new PropData.PropData().fromJSON(prop))
    }
    return this
  }

  toJSON(): IPlayerData {
    return this
  }
}

export interface IPlayerData {
  name: string | undefined
  inventory: Array<PropModel>
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean }
  // Poss. event actions
  //on_enter: string;
}
