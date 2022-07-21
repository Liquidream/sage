import { SAGE } from "../Manager";
import { SceneScreen } from "../screens/SceneScreen";
import { Serialization } from "../utils/Serialization";
import { IPropData, PropData } from "./PropData";
import { DoorData, IDoorData } from "./DoorData";

export class Scene implements ISceneData, Serialization<Scene> {
  public constructor() {
    // Anything?
  }

  public id = "";
  public image = "";
  public name = "";
  public sound = "";
  public firstVisit = true;
  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {};

  // Events
  public on_enter = "";
  public on_exit = "";

  public props: Array<PropData> = [];
  public doors: Array<DoorData> = [];


  screen!: SceneScreen;

  // public initialize(): void {
  //     // Anything?
  // }

  /**
   * Create scene and change display to it
   * 
   * (also destroy/release previous screen objects)
   */
  show(skipFade = false) {
    // Teardown current scene
    SAGE.World.currentScene?.teardown();
    // Clean up current scene "screen"
    SAGE.World.currentScene?.screen.tidyUp();
    // Create and switch to new "screen"
    this.screen = new SceneScreen(this)

    if (!skipFade) {
      SAGE.changeScreenFade(this.screen);
    } else {
      SAGE.changeScreen(this.screen);
    }

    // Remember the new scene
    // (happens in above function)
    SAGE.World.currentScene = this;
    SAGE.World.starting_scene_id = this.id;

    // DEBUG
    //console.log(SAGE.World.serialize());

    // Run any OnEnter action?
    if (this.on_enter) {
      SAGE.Script.safeExecFunc(this.on_enter);
    }
  }

  teardown() {
    // Run any OnEnter action?
    if (this.on_exit) {
      SAGE.Script.safeExecFunc(this.on_exit);
    }
    if (this.firstVisit) this.firstVisit = false;
  }

  addPropData(propData: PropData) {
    // add to list of props
    this.props.push(propData);
  }

  removePropDataById(propId: string) {
    // Remove data from prop list (no DisplayObject changes)
    const index = this.props.findIndex(item => item.id === propId)
    if (index !== -1) this.props.splice(index,1);
    
  }

  fromJSON(input: ISceneData) {
    this.id = input.id;
    this.image = input.image || "";
    this.name = input.name;
    this.sound = input.sound;
    if (input.firstVisit) this.firstVisit = input.firstVisit;
    if (input.property) this.property = input.property;
    this.on_enter = input.on_enter;
    this.on_exit = input.on_exit;
    for (const prop of input.props) {
      this.props.push(new PropData().fromJSON(prop))
    }
    for (const door of input.doors) {
      this.doors.push(new DoorData().fromJSON(door))
    }
    return this;
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
      doors: this.doors
    }
  }

}

export interface ISceneData {
  id: string;
  image: string;
  name: string;
  sound: string;
  firstVisit: boolean;
  // Key-Value pair to allow properties to be set/read
  property: { [key: string]: string | number | boolean };
  // Poss. event actions
  on_enter: string;
  on_exit: string;
  props: Array<IPropData>;
  doors: Array<IDoorData>;
}
