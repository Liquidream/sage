import { SAGE } from "../Manager";
import { Serialization } from "../utils/Serialization";
import { Prop } from "./Prop";
import { IPropData, PropData } from "./PropData";



export class Player implements IPlayerData, Serialization<Player> {

  

  public constructor() {
    // Anything?
  }
  public name: string | undefined;
  public inventory: Array<IPropData> = [];
  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {};

  /** Returns whether or not the specified prop id is in player's inventory */
  public hasPropInInventory(propId: string): boolean {
    return this.inventory.some(prop => prop.id === propId)
  }

  /** Remove (and return) the specified prop, if present */
  public addToInventory(propData: IPropData) {
    SAGE.World.player.inventory.push(propData);
    SAGE.invScreen.addProp(new Prop(propData))
  }

  /** Remove (and return) the specified prop, if present */
  public removeFromInventory(propId: string): IPropData | undefined {
    const index = this.inventory.findIndex(item => item.id === propId)
    let propData;
    if (index !== -1) propData = this.inventory.splice(index,1);
    //const propData = this.inventory.splice(this.inventory.findIndex(item => item.id === propId), 1);
    const prop = SAGE.invScreen.removeProp(propId)
    prop?.destroy();
    if (propData) return propData[0];
    return;
  }

  fromJSON(input: IPlayerData) {
    this.name = input.name;
    if (input.property) this.property = input.property;
    for (const prop of input.inventory) {
      this.inventory.push(new PropData().fromJSON(prop))
    }
    return this;
  }

  toJSON(): IPlayerData {
    return this;
  }

  // serialize(): string {
  //     return JSON.stringify(this);
  // }

}

export interface IPlayerData {
  name: string | undefined;
  inventory: Array<IPropData>;
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean };
  // Poss. event actions
  //on_enter: string;
}
