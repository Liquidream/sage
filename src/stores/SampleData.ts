import { DoorState } from "@/models/DoorModel"
import { useDoorStore } from "./DoorStore"
import { usePropStore } from "./PropStore"
import { useSceneStore } from "./SceneStore"
import { useWorldStore } from "./WorldStore"
import { useActorStore } from "./ActorStore"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

export class SampleData {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static async resetToDemoData() {
    const response = await fetch("https://raw.githubusercontent.com/Liquidream/sage/refs/heads/dev/sample_games/found-sageData.json")
    // const response = await fetch("https://raw.githubusercontent.com/Liquidream/sage/dev/sample_games/demoData-ransom.json")

    const sageEditData = await response.json()

    const worldStore = useWorldStore()
    const propStore = usePropStore()
    const sceneStore = useSceneStore()
    const doorStore = useDoorStore()
    const actorStore = useActorStore()
    // Populate state
    worldStore.$state = sageEditData.worldData
    sceneStore.$state = sageEditData.sceneData
    propStore.$state = sageEditData.propData
    doorStore.$state = sageEditData.doorData
    actorStore.$state = sageEditData.actorData
    //usePlayerStore().$state = sageEditData.playerData

    // Hack to ensure all state is restored before
    // trying to redraw the current screen
    // else get missing objects
    // (TODO: potentially skip if no curr scene???)
    Promise.all([
      worldStore.$persistedState.isReady(),
      sceneStore.$persistedState.isReady(),
      propStore.$persistedState.isReady(),
      doorStore.$persistedState.isReady(),
      actorStore.$persistedState.isReady(),
    ]).then(() => {
      console.log(">>>> All stores hydrated (reset data), now initialise SceneScreen")
      SAGEdit.currentScreen.setup()
      console.log(">>> (finished resetting data)")
    })
  }
}
