import { SAGE } from "./SAGEPlay"
//import type { Serialization } from "../utils/Serialization"
import { Prop } from "./Prop"
//import * as PropData from "./data/PropData"
import { PropLocationType, type PropModel } from "@/models/PropModel"
import { useGameStateStore } from "@/stores/GameStateStore"
import type { SaveStateModel } from "@/models/SaveStateModel"
//import { InkList, InkListItem } from "inkjs/engine/InkList"
import { InkManager } from "@/utils/InkManager"

//export class Player implements IPlayerData, Serialization<Player> {
export class Player implements IPlayerData {
  public constructor() {
    // Anything?
  }

  private gameStateStore = useGameStateStore()

  public name: string | undefined

  public inventory: PropModel[] = []
  // public get inventory(): PropModel[] {
  //   return this.playerStore.inventory
  // }
  // public inventory: Array<PropModel> = []

  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {}

  public get gameState(): SaveStateModel {
    return this.gameStateStore.saveState
  }

  /** Returns whether or not the specified prop id is in player's inventory */
  public hasPropInInventory(propId: string): boolean {
    return this.inventory.some((prop) => prop.id === propId)
  }

  /** Add the specified prop top inventory */
  public addToInventory(propData: PropModel) {
    propData.location_type = PropLocationType.Inventory
    propData.location_id = ""
    SAGE.World.player.inventory.push(propData)
    SAGE.invScreen.addProp(new Prop(propData))
    // Update ink story state
    const listItem = `prp_${propData.id}`
    InkManager.inkStory.EvaluateFunction("pickup_item", [listItem])
  }

  /** Remove (and return) the specified prop, if present */
  public removeFromInventory(propId: string): PropModel | undefined {
    // Update ink story state
    const listItem = `prp_${propId}`
    InkManager.inkStory.EvaluateFunction("drop_item", [listItem])
    // Remove from game inventory
    const index = this.inventory.findIndex((item) => item.id === propId)
    let propData
    if (index !== -1) propData = this.inventory.splice(index, 1)
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
  gameState: SaveStateModel
  // Poss. event actions
  //on_enter: string;
}
