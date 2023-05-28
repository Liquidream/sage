import { Application, Container, DisplayObject, filters } from "pixi.js"
import { Tween } from "tweedle.js"
import { Dialog, DialogChoice } from "./Dialog"
import { Events } from "./Events"
import { Actions } from "./gameactions"
import { Script } from "./Script"
import { Sound } from "./Sound"
import { World } from "./World"
import { InventoryScreen } from "./screens/ui/InventoryPanel"
import { UI_Overlay } from "./screens/ui/UI_Overlay"
import { playAssets } from "./playAssets"

//import gamedataJSON from "./gamedata.json"
//const gamedata: IWorldData = (<unknown>gamedataJSON) as IWorldData

// This could have a lot more generic functions that you force all your scenes to have. Update is just an example.
// Also, this could be in its own file...
export interface IScreen extends DisplayObject {
  update(framesPassed: number): void

  // we added the resize method to the interface
  //resize(screenWidth: number, screenHeight: number): void;
}

export class SAGE {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = false

  public static enableFullscreen = false

  public static navWidth = 350

  private static playManifest = playAssets

  private static _app: Application
  private static _width: number
  private static _height: number
  private static backLayer: Container
  private static midLayer: Container
  private static topLayer: Container
  public static currentScreen: IScreen // was private (should it be?)

  private static invScreen: InventoryScreen

  public static World: World
  public static Dialog: Dialog
  public static Actions: Actions
  public static Script: Script
  public static Events: Events
  public static Sound: Sound
  public static UI_Overlay: UI_Overlay

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
    // Initialise UI
    SAGE.UI_Overlay = new UI_Overlay(SAGE.topLayer)

    // Create and initialise game world
    SAGE.World = new World()
    SAGE.World.initialize() //gamedata)
    //Manager.World = new World().fromJSON(gamedata);

    // ...and events
    SAGE.Events = new Events()

    // ...and inventory (UI)
    SAGE.invScreen = new InventoryScreen(SAGE.topLayer)

    // ...and game actions
    SAGE.Actions = new Actions()

    // ...and dialog
    SAGE.Dialog = new Dialog()
    // This seems wrong, but not sure how else to expose type at top-level
    window.DialogChoice = DialogChoice
    // (Not ideal, would rather expose as "DialogChoice" as shorter)
    //SAGE.DialogChoice = DialogChoice

    // ...and script
    SAGE.Script = new Script()
    SAGE.Script.initialize()

    // ...and sounds
    SAGE.Sound = new Sound()
    // Load and convert byte64 data to sounds
    this.loadSounds()
  }

  private static loadSounds() {
    // debugger
    for (const scene of SAGE.World.scenes) {
      // Should only happen while "testing" game, not in "release"
      if (scene.sound && scene.sound.startsWith("data:")) {
        const assetName = scene.name + "-sound"
        const data = scene.sound.split(",").slice(1).join(",")
        const buffer = SAGE.base64ToArrayBuffer(data)
        SAGE.Sound.soundLibrary.add(assetName, buffer)
        scene.sound = assetName
      }
    }
  }

  /**
   * Utility function to convert base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string) {
    const binary_string = window.atob(base64)
    const len = binary_string.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  }

  public static startGame() {
    SAGE.World.start()
    //Manager.changeScreen(new SceneScreen(Manager.World.scenes[0]));

    // DEBUG
    //SAGE.inventoryScreen.getLength();
  }

  /** Restart the game
   * (+reset game data) */
  public static restartGame() {
    console.log("Restarting game...")
    SAGE.Sound.stopAll()
    SAGE.World.stop()
    SAGE.emptyLayers()
    SAGE.loadWorld()
    SAGE.startGame()
  }

  public static gameOver(message: string) {
    SAGE.Sound.play("SFX-GameLost")
    SAGE.invScreen.close()
    SAGE.World.currentScene.screen.showGameOver(message)
  }

  public static gameWon(message: string) {
    SAGE.Sound.play("SFX-GameWon")
    SAGE.invScreen.close()
    SAGE.World.currentScene.screen.showGameWon(message)
  }

  public static resize() {
    console.log("SAGE:resize()...")
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
      screenWidth / SAGE.width, // factor in the side-bar to make it fit 100%
      screenHeight / SAGE.height
    )

    // console.log(`scale = ${scale}`)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * SAGE.width)
    const enlargedHeight = Math.floor(scale * SAGE.height)

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    if (SAGE._app && SAGE._app.view.style) {
      // now we use css trickery to set the sizes and margins
      SAGE._app.view.style.width = `${enlargedWidth}px`
      SAGE._app.view.style.height = `${enlargedHeight}px`

      // center vertically and horizontally
      SAGE._app.view.style.marginTop =
        SAGE._app.view.style.marginBottom = `${verticalMargin}px`
      SAGE._app.view.style.marginLeft =
        SAGE._app.view.style.marginRight = `${horizontalMargin}px`
    }
  }

  // Call this function when you want to go to a new scene
  public static changeScreen(newScene: IScreen) {
    console.log("in changeScreen(IScreen)")
    // Remove and destroy old scene... if we had one..
    if (SAGE.currentScreen) {
      // remove all event subscriptions
      SAGE.midLayer.removeChild(SAGE.currentScreen)
      //SAGE._app.stage.removeChild(SAGE.currentScreen);
      SAGE.currentScreen.destroy()
    }

    // Add the new one
    SAGE.currentScreen = newScene
    SAGE.midLayer.addChild(SAGE.currentScreen)
    //SAGE._app.stage.addChild(SAGE.currentScreen);
  }

  public static changeScreenFade(newScene: IScreen) {
    const oldScreen = SAGE.currentScreen
    // Fade out
    // https://github.com/pixijs/pixijs/issues/4334
    const fadeOutAlphaMatrix = new filters.AlphaFilter()
    fadeOutAlphaMatrix.alpha = 1
    oldScreen.filters = [fadeOutAlphaMatrix]

    const fadeOutTween = new Tween(fadeOutAlphaMatrix).to({ alpha: 0 }, 500)

    // Fade in
    const fadeInAlphaMatrix = new filters.AlphaFilter()
    fadeInAlphaMatrix.alpha = 0
    newScene.filters = [fadeInAlphaMatrix]
    const fadeInTween = new Tween(fadeInAlphaMatrix)
      .to({ alpha: 1 }, 500)
      .onComplete(() => {
        // Add the new one
        // Remove and destroy old scene... if we had one..
        if (oldScreen) {
          // remove all event subscriptions
          SAGE.backLayer.removeChild(oldScreen)
          //SAGE.midLayer.removeChild(oldScreen)
          //SAGE._app.stage.removeChild(oldScreen);
          oldScreen.destroy()
        }
      })

    SAGE.currentScreen = newScene
    // Moved main gameplay to back layer
    // so we can blur/lock it when talking/examining objects
    SAGE.backLayer.addChild(newScene)
    //SAGE.midLayer.addChild(newScene)

    // Start the fade out+in animation
    fadeOutTween.chain(fadeInTween).start()

    // If inventory open, auto-collapse it
    if (SAGE.invScreen.isOpen) SAGE.invScreen.close()
  }

  // Conditional console.log (if debugMode is true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debugLog(message: any) {
    if (SAGE.debugMode) console.debug(message)
  }

  // This update will be called by a pixi ticker and tell the scene that a tick happened
  private static update(framesPassed: number) {
    // Let the current scene know that we updated it...
    // Just for funzies, sanity check that it exists first.
    if (SAGE.currentScreen) {
      SAGE.currentScreen.update(framesPassed)
    }

    // as I said before, I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`
  }
}
