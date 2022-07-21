import { Text, TextStyle } from "pixi.js"
//import { PixiApp } from "@/app/PixiApp"
import { useSceneStore } from "@/stores/SceneStore"
import { SAGE } from "@/SAGE"

export class SceneModel {
  private _X = 500
  private _Y = 100

  private dialogText!: Text | null
  //graphy?: Graphics
  //prop?: Prop

  constructor() {
    //
    this.setup()
  }

  setup() {
    const sceneStore = useSceneStore()
    // Subscribe to state changes so that we refresh/recreate Pixi.js content
    sceneStore.$subscribe((mutation, state) => {
      //console.log("state updated - so refresh scene model (pixi)")
      this.teardown()
      this.setup()
    })

    // Create text
    const styly: TextStyle = new TextStyle({
      align: "center",
      fill: "#fff",
      fontSize: 47,
      strokeThickness: 6,
      lineJoin: "round",
      wordWrap: true,
      wordWrapWidth: 1280 / 2,
    })
    this.dialogText = new Text(sceneStore.name, styly) // Text supports unicode!
    this.dialogText.x = 800
    this.dialogText.y = 300
    this.dialogText.anchor.set(0.5)
    // .text = "This is expensive to change, please do not abuse";
    SAGE.app.stage.addChild(this.dialogText)

    // Subscribe to state changes
  }

  teardown() {
    //
    if (this.dialogText) {
      SAGE.app.stage.removeChild(this.dialogText)
      this.dialogText = null
    }
  }
}
