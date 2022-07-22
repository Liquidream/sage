import { Application, Container } from "pixi.js"
import { SceneData } from "./sage/SceneData"
import { Events } from "./sage/Events"
import { SceneScreen } from "./screens/SceneScreen"
import { Dialog } from "./sage/Dialog"

export class SAGE {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true
  public static enableFullscreen = false

  private static _app: Application
  private static _width: number
  private static _height: number

  private static backLayer: Container
  private static midLayer: Container
  private static topLayer: Container
  private static currentScreen: SceneScreen

  // public static World: World;
  public static Dialog: Dialog
  // public static Actions: Actions;
  // public static Script: Script;
  public static Events: Events
  // public static Sound: Sound;
  // public static UI_Overlay: UI_Overlay;

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

    // Lock to 30fps (for cinematic effect)
    // ## REMOVED as made inventory jerky (+no longer CAGE/Cinematic engine anyway)
    // SAGE._fps = 30;
    // SAGE._app.ticker.maxFPS = SAGE._fps;

    // listen for the browser telling us that the screen size changed
    window.addEventListener("resize", SAGE.resize)

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
    const scene = new SceneData()
    scene.name = "Test"
    SAGE.currentScreen = new SceneScreen(scene)

    //   //const gamedata = require("./gamedata.json");
    //   //import * as gamedata from "./gamedata.json";
    //   //let gamedata = JSON.parse(fs.readFileSync("./gamedata.json", "utf-8"));
    //   // Initialise UI
    //   SAGE.UI_Overlay = new UI_Overlay(SAGE.topLayer);
    //   // Create and initialise game world
    //   SAGE.World = new World();
    //   SAGE.World.initialize(gamedata);
    //   //Manager.World = new World().fromJSON(gamedata);
    // ...and events
    SAGE.Events = new Events()
    //   // ...and inventory (UI)
    //   SAGE.invScreen = new InventoryScreen(SAGE.topLayer);
    //   // ...and game actions
    //   SAGE.Actions = new Actions();
    // ...and dialog
    SAGE.Dialog = new Dialog()
    //   // ...and script
    //   SAGE.Script = new Script();
    //   SAGE.Script.initialize();
    //   // ...and sounds
    //   SAGE.Sound = new Sound();
  }

  public static resize() {
    // current screen size
    const screenWidth = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    )
    const screenHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    )

    // uniform scale for our game
    const scale = Math.min(screenWidth / SAGE.width, screenHeight / SAGE.height)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * SAGE.width)
    const enlargedHeight = Math.floor(scale * SAGE.height)

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    // now we use css trickery to set the sizes and margins
    SAGE._app.view.style.width = `${enlargedWidth}px`
    SAGE._app.view.style.height = `${enlargedHeight}px`
    SAGE._app.view.style.marginLeft =
      SAGE._app.view.style.marginRight = `${horizontalMargin}px`
    SAGE._app.view.style.marginTop =
      SAGE._app.view.style.marginBottom = `${verticalMargin}px`
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
