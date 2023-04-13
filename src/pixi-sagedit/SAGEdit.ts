import { Application, Container } from "pixi.js"
import { SceneScreen } from "./screens/SceneScreenEdit"
import { DialogEdit } from "./DialogEdit"

export class SAGEdit {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true
  public static enableFullscreen = false

  public static navWidth = 350
  public static currentScreen: SceneScreen // was private (should it be?)

  private static _app: Application
  private static _width: number
  private static _height: number

  private static backLayer: Container
  private static midLayer: Container
  private static topLayer: Container

  // public static World: World;
  public static Dialog: DialogEdit
  // public static Actions: Actions;
  // public static Script: Script;
  //public static Events: Events
  // public static Sound: Sound;
  // public static UI_Overlay: UI_Overlay;

  // public static invScreen: InventoryScreen;
  public static get width(): number {
    return SAGEdit._width
  }
  public static get height(): number {
    return SAGEdit._height
  }

  // PN: Expose the Application object (for now)
  // TODO: Prob come up with a better structure so top "sage" class creates it, then nested classes uses it (e.g. sage.dialog)
  public static get app(): Application {
    return SAGEdit._app
  }

  public static initialize(
    width: number,
    height: number,
    background: number
  ): void {
    console.log("SAGEdit:initialize()...")
    SAGEdit._width = width
    SAGEdit._height = height

    SAGEdit._app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      //resolution: window.devicePixelRatio || 1, // This distorts/wrong on mobile
      autoDensity: true,
      backgroundColor: background,
      width: width,
      height: height,
    })

    SAGEdit._app.ticker.add(SAGEdit.update)

    // (REMOVED: Now using Vuetify useDisplay() reactive property)
    // listen for the browser telling us that the screen size changed
    //window.addEventListener("resize", SAGEdit.resize)

    // call it manually once so we are sure we are the correct size after starting
    SAGEdit.resize()

    // initialise stage "layers"
    SAGEdit.createLayers()
  }

  static createLayers() {
    // Background layer
    SAGEdit.backLayer = new Container()
    SAGEdit._app.stage.addChild(SAGEdit.backLayer)
    // Mid-ground layer
    SAGEdit.midLayer = new Container()
    SAGEdit._app.stage.addChild(SAGEdit.midLayer)
    // Foreground/UI layer
    SAGEdit.topLayer = new Container()
    SAGEdit._app.stage.addChild(SAGEdit.topLayer)
  }

  static emptyLayers() {
    // Background layer
    SAGEdit.backLayer.removeChildren()
    // Mid-ground layer
    SAGEdit.midLayer.removeChildren()
    // Foreground/UI layer
    SAGEdit.topLayer.removeChildren()
  }

  public static loadWorld(): void {
    //scene.name = "Test"
    SAGEdit.currentScreen = new SceneScreen()
    SAGEdit.midLayer.addChild(SAGEdit.currentScreen)

    /* Thought
    - Split store to many files (they are basically composables)
    - Split them logcally - think we'll have:
       > SceneStore
       > PropStore
       > PlayerStore
       > etc.
    - (Means that Prop will have to have a ref (id?) to Scene it's located in)
    - 
*/
    // ...and dialog
    // (currently using it to display selected item name - not essential!)
    SAGEdit.Dialog = new DialogEdit()
  }

  public static resize() {
    console.log("SAGEdit:resize()...")
    // instead of basing it on screen width,
    // base it on main (e.g. -navbar) width
    const mainWrap = document.getElementsByClassName("v-main")[0]

    // current screen size
    const screenWidth = mainWrap?.clientWidth
    const screenHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    )

    const isMobile = screenHeight > screenWidth
    console.log(`isMobile = ${isMobile}`)
    // uniform scale for our game
    const scale = Math.min(
      (screenWidth - (isMobile ? 0 : SAGEdit.navWidth)) / SAGEdit.width, // factor in the side-bar to make it fit 100%
      screenHeight / SAGEdit.height
    )

    // console.log(`scale = ${scale}`)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * SAGEdit.width)
    const enlargedHeight = Math.floor(scale * SAGEdit.height)

    // margins for centering our game
    //const horizontalMargin = (screenWidth - enlargedWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    if (SAGEdit._app) {
      // now we use css trickery to set the sizes and margins
      SAGEdit._app.view.style.width = `${enlargedWidth}px`
      SAGEdit._app.view.style.height = `${enlargedHeight}px`

      // center vertically ONLY if not in "mobile" mode
      if (!isMobile) {
        SAGEdit._app.view.style.marginTop =
          SAGEdit._app.view.style.marginBottom = `${verticalMargin}px`
      } else {
        SAGEdit._app.view.style.marginTop = `$0px`
      }
    }
  }

  // Conditional console.log (if debugMode is true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debugLog(message: any) {
    if (SAGEdit.debugMode) console.debug(message)
  }

  // This update will be called by a pixi ticker and tell the scene that a tick happened
  private static update() {
    //framesPassed: number) {
    // Let the current scene know that we updated it...
    // Just for funzies, sanity check that it exists first.
    if (SAGEdit.currentScreen) {
      SAGEdit.currentScreen.update() //framesPassed)
    }

    // as I said before, I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`
  }
}
