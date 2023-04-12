import { Application, Container } from "pixi.js"
import type { SceneScreen } from "./screens/SceneScreen"
import { InventoryScreen } from "./screens/ui/InventoryPanel"
import { UI_Overlay } from "./screens/ui/UI_Overlay"
import { Dialog } from "./Dialog"
import { Events } from "./Events"
import { Script } from "./Script"
import type { Sound } from "./Sound"
import { World } from "./World"
//import { Actions } from "../gameactions"

export class SAGE {
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

  public static World: World;
  public static Dialog: Dialog
  //public static Actions: Actions;
  public static Script: Script;
  public static Events: Events
  public static Sound: Sound;
  public static UI_Overlay: UI_Overlay;

  // public static invScreen: InventoryScreen;
  public static get width(): number {
    return SAGE._width
  }
  public static get height(): number {
    return SAGE._height
  }

  // PN: Expose the Application object (for now)
  // TODO: Prob come up with a better structure so top "sage" class creates it, then nested classes uses it (e.g. sage.dialog)
  public static get app(): Application {
    return SAGE._app
  }

  public static initialize(
    width: number,
    height: number,
    background: number
  ): void {
    console.log("SAGE:initialize()...")
    SAGE._width = width
    SAGE._height = height

    SAGE._app = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      //resolution: window.devicePixelRatio || 1, // This distorts/wrong on mobile
      autoDensity: true,
      backgroundColor: background,
      width: width,
      height: height,
    })

    SAGE._app.ticker.add(SAGE.update)

    // (REMOVED: Now using Vuetify useDisplay() reactive property)
    // listen for the browser telling us that the screen size changed
    //window.addEventListener("resize", SAGE.resize)

    // call it manually once so we are sure we are the correct size after starting
    SAGE.resize()

    // initialise stage "layers"
    SAGE.createLayers()
  }

  static createLayers() {
    // Background layer
    SAGE.backLayer = new Container()
    SAGE._app.stage.addChild(SAGE.backLayer)
    // Mid-ground layer
    SAGE.midLayer = new Container()
    SAGE._app.stage.addChild(SAGE.midLayer)
    // Foreground/UI layer
    SAGE.topLayer = new Container()
    SAGE._app.stage.addChild(SAGE.topLayer)
  }

  static emptyLayers() {
    // Background layer
    SAGE.backLayer.removeChildren()
    // Mid-ground layer
    SAGE.midLayer.removeChildren()
    // Foreground/UI layer
    SAGE.topLayer.removeChildren()
  }

  public static loadWorld(): void {
    // Initialise UI
    SAGE.UI_Overlay = new UI_Overlay(SAGE.topLayer);

    // Create and initialise game world
    SAGE.World = new World();
    SAGE.World.initialize(gamedata);
    //Manager.World = new World().fromJSON(gamedata);

    // ...and events
    SAGE.Events = new Events();

    // ...and inventory (UI)
    SAGE.invScreen = new InventoryScreen(SAGE.topLayer);

    // ...and game actions
    SAGE.Actions = new Actions();


    // ...and dialog
    SAGE.Dialog = new Dialog();

    // ...and script
    SAGE.Script = new Script();
    SAGE.Script.initialize();
  }

  public static resize() {
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
      (screenWidth - (isMobile ? 0 : SAGE.navWidth)) / SAGE.width, // factor in the side-bar to make it fit 100%
      screenHeight / SAGE.height
    )

    // console.log(`scale = ${scale}`)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * SAGE.width)
    const enlargedHeight = Math.floor(scale * SAGE.height)

    // margins for centering our game
    //const horizontalMargin = (screenWidth - enlargedWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    if (SAGE._app) {
      // now we use css trickery to set the sizes and margins
      SAGE._app.view.style.width = `${enlargedWidth}px`
      SAGE._app.view.style.height = `${enlargedHeight}px`

      // center vertically ONLY if not in "mobile" mode
      if (!isMobile) {
        SAGE._app.view.style.marginTop =
          SAGE._app.view.style.marginBottom = `${verticalMargin}px`
      } else {
        SAGE._app.view.style.marginTop = `$0px`
      }
    }
  }

  // Conditional console.log (if debugMode is true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debugLog(message: any) {
    if (SAGE.debugMode) console.debug(message)
  }

  // This update will be called by a pixi ticker and tell the scene that a tick happened
  private static update() {
    //framesPassed: number) {
    // Let the current scene know that we updated it...
    // Just for funzies, sanity check that it exists first.
    if (SAGE.currentScreen) {
      SAGE.currentScreen.update() //framesPassed)
    }

    // as I said before, I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`
  }
}
