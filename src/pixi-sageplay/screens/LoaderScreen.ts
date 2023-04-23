import { SAGE } from "@/pixi-sageplay/SAGEPlay"
import { Container, Graphics, Assets } from "pixi.js"
//import { assets } from "../../assets"
//import { IScreen, SAGE } from "../Manager"
import { Button } from "@/pixi-sageplay/screens/ui/Button"
import { Fullscreen } from "@/utils/Fullscreen"

export class LoaderScreen extends Container {
  // Colour scheme
  readonly colPrime = 0x0a62be
  readonly colSecond = 0x1d2b53

  // for making our loader graphics...
  private loaderBar: Container
  private loaderBarBorder: Graphics
  private loaderBarFill: Graphics

  constructor() {
    super()

    const loaderBarWidth = SAGE.width * 0.7
    const loaderBarHeight = SAGE.height * 0.1

    this.loaderBarFill = new Graphics()
    this.loaderBarFill.beginFill(this.colPrime, 1)
    this.loaderBarFill.drawRect(0, 0, loaderBarWidth, loaderBarHeight)
    this.loaderBarFill.endFill()
    this.loaderBarFill.scale.x = 0

    this.loaderBarBorder = new Graphics()
    this.loaderBarBorder.lineStyle(10, this.colSecond, 1)
    this.loaderBarBorder.drawRect(0, 0, loaderBarWidth, loaderBarHeight)

    this.loaderBar = new Container()
    this.loaderBar.addChild(this.loaderBarFill)
    this.loaderBar.addChild(this.loaderBarBorder)
    this.loaderBar.position.x = (SAGE.width - this.loaderBar.width) / 2
    this.loaderBar.position.y = (SAGE.height - this.loaderBar.height) / 2
    this.addChild(this.loaderBar)

    // Start loading!
    this.initializeLoader().then(() => {
      // Remember that constructors can't be async, so we are forced to use .then(...) here!
      this.gameLoaded()
    })
  }

  public update() {
    //_framesPassed: number) {
    // To be a scene we must have the update method even if we don't use it.
  }

  private async initializeLoader(): Promise<void> {
    console.log("in initializeLoader()...")
    // use .json file
    await Assets.init({ manifest: "assets.json" })
    //await Assets.init({ manifest: SAGE.playManifest })

    await Assets.loadBundle("load-screen", this.downloadProgress.bind(this))
    // debugger

    console.log("initializeLoader() done.")
  }

  private downloadProgress(progressRatio: number): void {
    // progressRatio goes from 0 to 1, so set it to scale
    this.loaderBarFill.scale.x = progressRatio
  }

  private gameLoaded() {
    console.log("gameLoaded()...")
    // Remove loading bar
    this.removeChild(this.loaderBar)

    if (SAGE.enableFullscreen) this.showStartButton()
    else {
      SAGE.loadWorld()
      SAGE.startGame()
    }
  }

  private showStartButton() {
    // Make a center point of origin (anchor)
    const x = SAGE.width / 2
    const y = SAGE.height / 2
    const w = 550
    const h = 175

    const button = new Button("Start Game", x, y, w, h)
    this.addChild(button)
    button.on("pointertap", () => {
      // Launch fullscreen
      Fullscreen.openFullscreen()
      // Change scene to the game scene!
      SAGE.loadWorld()
      //SAGEdit.startGame()
    })
  }
}
