import { Application, Container } from "pixi.js"
import { SceneScreen } from "./screens/SceneScreenEdit"
import { DialogEdit } from "./DialogEdit"
import { EventsEdit } from "./EventsEdit"
import { useSageEditStore } from "@/stores/SAGEditStore"
import type { SagePlayData } from "@/pixi-sageplay/SagePlayData"
import { useWorldStore } from "@/stores/WorldStore"
import { useSceneStore } from "@/stores/SceneStore"
import { usePropStore } from "@/stores/PropStore"
import { useDoorStore } from "@/stores/DoorStore"
import { useActorStore } from "@/stores/ActorStore"
import { usePlayerStore } from "@/stores/PlayerStore"
import { Compiler, Story } from "inkjs"
import { CompilerOptions } from "inkjs/compiler/CompilerOptions"
import { ErrorType } from "inkjs/engine/Error"
import { JsonFileHandler } from "inkjs/compiler/FileHandler/JsonFileHandler"
import { StringUtils } from "@/utils/StringUtils"

export class SAGEdit {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true
  public static enableFullscreen = false

  public static navWidth = 350
  public static sceneListHeight = 75

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
  public static Events: EventsEdit
  // public static Sound: Sound;
  // public static UI_Overlay: UI_Overlay;

  // Initialise InkJS (this might not be the right place...)
  //private static inkStory: InstanceType<typeof Story>
  //private static inkCompiler: InstanceType<typeof Compiler>
  //private static inkJsonFileHandler: InstanceType<typeof JsonFileHandler>
  //private static inkCompilerLog: string[] = []

  public static inkHeaderScene: string
  public static inkHeaderActor: string
  public static inkHeaderProp: string
  public static inkHeaderDoor: string

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

    // (REMOVED, as not being used in editor, currently)
    // Update time-based things, like tweens
    //SAGEdit._app.ticker.add(SAGEdit.update)

    // (REMOVED: Now using Vuetify useDisplay() reactive property)
    // listen for the browser telling us that the screen size changed
    //window.addEventListener("resize", SAGEdit.resize)

    // call it manually once so we are sure we are the correct size after starting
    SAGEdit.resize()

    // initialise stage "layers"
    SAGEdit.createLayers()

    // ...and events
    SAGEdit.Events = new EventsEdit()

    // ...and dialog
    // (currently using it to display selected item name - not essential!)
    SAGEdit.Dialog = new DialogEdit()

    // Initialise the ink headers for Scenes, Actors, etc.
    SAGEdit.initInkScriptHeaders()
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
    // Moved main gameplay to back layer
    // so we can blur/lock it when talking/examining objects
    SAGEdit.backLayer.addChild(SAGEdit.currentScreen)
    //SAGEdit.midLayer.addChild(SAGEdit.currentScreen)
  }

  public static resize() {
    console.log("SAGEdit:resize()...")
    // instead of basing it on screen width,
    // base it on main (e.g. -navbar) width
    const mainWrap = document.getElementsByClassName("v-main")[0]

    // current screen size
    // const screenWidth = mainWrap?.clientWidth
    // const screenWidth = Math.max(
      //   mainWrap?.clientWidth, 
      //   window.innerWidth || 0)
    const screenWidth = mainWrap?.clientWidth
    const screenHeight = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    )

    const isMobile = screenHeight > screenWidth
    console.log(`isMobile = ${isMobile}`)
    const toolbarHeight = 64
    // uniform scale for our game
    const scale = Math.min(
      (screenWidth - (isMobile ? 0 : SAGEdit.navWidth)) / SAGEdit.width, // factor in the side-bar to make it fit 100%
      (screenHeight - (isMobile ? 0 : toolbarHeight + SAGEdit.sceneListHeight)) / SAGEdit.height
    )

    // console.log(`scale = ${scale}`)

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * SAGEdit.width)
    const enlargedHeight = Math.floor(scale * SAGEdit.height)

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth - SAGEdit.navWidth) / 2
    const verticalMargin = (screenHeight - enlargedHeight) / 2

    // console.log(`verticalMargin = ${verticalMargin}px`)
    // console.log(`horizontalMargin = ${horizontalMargin}px`)

    if (SAGEdit._app && SAGEdit._app.view.style) {
      // now we use css trickery to set the sizes and margins
      SAGEdit._app.view.style.width = `${enlargedWidth}px`
      SAGEdit._app.view.style.height = `${enlargedHeight}px`

      // center vertically ONLY if not in "mobile" mode
      if (!isMobile) {
        // SAGEdit._app.view.style.marginTop =
        //   SAGEdit._app.view.style.marginBottom = `${verticalMargin}px`
        // SAGEdit._app.view.style.marginLeft = `${horizontalMargin}px`
      } else {
        SAGEdit._app.view.style.marginTop = `$0px`
        SAGEdit._app.view.style.marginLeft = `$0px`
      }
    }
  }

  // Conditional console.log (if debugMode is true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debugLog(message: any) {
    if (SAGEdit.debugMode) console.debug(message)
  }

  /**
   * Play test the game
   */
  public static playGame() {
    console.log("in playGame()...")
    // Get the current "edit" data
    const editStore = useSageEditStore()
    const playData = {} as SagePlayData
    playData.version = editStore.version
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = editStore.gameId
    playData.worldData = JSON.stringify(useWorldStore().$state)
    playData.sceneData = JSON.stringify(useSceneStore().$state)
    playData.propData = JSON.stringify(usePropStore().$state)
    playData.doorData = JSON.stringify(useDoorStore().$state)
    playData.actorData = JSON.stringify(useActorStore().$state)
    playData.playerData = JSON.stringify(usePlayerStore().$state)
    playData.scriptData = SAGEdit.generateInkStoryJson()

    window.sagePlayData = playData

    // Launch "Play" window
    window.open("?mode=play", "sagePlay")
  }

  public static validateScript(): string[] {
    // Compile ink script and store any errors locally,
    // so can view later
    const compilerLog: string[] = []

    const jsonFileHandler = new JsonFileHandler(
      SAGEdit.generateInkScriptJsonSourcePackage()
    )

    //SAGEdit.inkCompiler = new Compiler(SAGEdit.generateInkScript(), {
    const inkCompiler = new Compiler(
      jsonFileHandler.LoadInkFileContents("_main.ink"),
      {
      errorHandler: (msg, type) => {
          if (type == ErrorType.Warning) console.warn(msg)
          else console.error(msg)
          compilerLog.push(msg)
        },
        countAllVisits: true,
        fileHandler: jsonFileHandler,
        pluginNames: [],
        sourceFilename: null,
      }
    )
    try {
      //debugger
      const inkStory = inkCompiler.Compile()
      // DEBUG
      //const jsonBytecode = inkStory.ToJson()
      //console.log(jsonBytecode)
    } catch (err) {
      //console.error(err)
    }

    return compilerLog
  }

  public static generateInkStoryJson(): string {
    let inkStoryJson = ""
    
    const jsonFileHandler = new JsonFileHandler(
      SAGEdit.generateInkScriptJsonSourcePackage()
    )

    //SAGEdit.inkCompiler = new Compiler(SAGEdit.generateInkScript(), {
    const inkCompiler = new Compiler(
      jsonFileHandler.LoadInkFileContents("_main.ink"),
      {
        errorHandler: (msg, type) => {
          if (type == ErrorType.Warning) console.warn(msg)
          else console.error(msg)
        },
        countAllVisits: true,
        fileHandler: jsonFileHandler,
        pluginNames: [],
        sourceFilename: null,
      }
    )
    try {
      //debugger
      const inkStory = inkCompiler.Compile()
      // DEBUG
      inkStoryJson = inkStory.ToJson()
      //console.log(jsonBytecode)
    } catch (err) {
      console.error(err)
    }

    return inkStoryJson
  }

  private static initInkScriptHeaders() {
    SAGEdit.inkHeaderScene = "=== ${id} ===\n # SCENE: ${id}\n {! }"
    SAGEdit.inkHeaderActor =
      "=== ${id} ===\n\n = init\n // TODO: setup stuff here?\n -> DONE\n\n= start"
    SAGEdit.inkHeaderProp = SAGEdit.inkHeaderActor
    SAGEdit.inkHeaderDoor = SAGEdit.inkHeaderActor

  
// https://stackoverflow.com/questions/8488729/how-to-count-the-number-of-lines-of-a-string-in-javascript
//Using a regular expression you can count the number of lines as
//str.split(/\r\n|\r|\n/).length

  }

  private static generateInkScriptJsonSourcePackage(): Record<string, string> {
    // Loop through all the game elements and build a single ink script (+compile it)
    const inkPackage: Record<string, string> = {
      "_main.ink": "",
    }
    let mainInkWithIncludes = ""
    // ----------------
    // Scenes
    //
    //debugger
    for (const scene of useSceneStore().scenes) {
      const inkName = `${scene.id}.ink`
      let inkScript = StringUtils.inject(SAGEdit.inkHeaderScene, {
        id: scene.id,
      })
//       let inkScript = `
// === ${scene.id} ===
// # SCENE: ${scene.id}
// {! }`
      if (scene.script) {
        inkScript += `\n${scene.script}`
      }
      inkScript += "\n-> DONE\n"
      inkPackage[inkName] = inkScript
      mainInkWithIncludes += `INCLUDE ${inkName}\n`
    }
    // ----------------
    // Actors
    //
    for (const actor of useActorStore().actors) {
      const inkName = `${actor.id}.ink`
      mainInkWithIncludes += `INCLUDE ${inkName}\n`
      let inkScript = StringUtils.inject(SAGEdit.inkHeaderActor, {
        id: actor.id,
      })
//       let inkScript = `
// === ${actor.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
      if (actor.script) {
        inkScript += `\n${actor.script}`
      }
      inkScript += "\n-> DONE\n"
      inkPackage[inkName] = inkScript
    }
    // ----------------
    // Props
    //
    for (const prop of usePropStore().props) {
      const inkName = `${prop.id}.ink`
      mainInkWithIncludes += `INCLUDE ${inkName}\n`
      let inkScript = StringUtils.inject(SAGEdit.inkHeaderProp, {
        id: prop.id,
      })
//       let inkScript = `
// === ${prop.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
      if (prop.script) {
        inkScript += `\n${prop.script}`
      }
      inkScript += "\n-> DONE\n"
      inkPackage[inkName] = inkScript
    }
    // ----------------
    // Doors
    //
    for (const door of useDoorStore().doors) {
      const inkName = `${door.id}.ink`
      mainInkWithIncludes += `INCLUDE ${inkName}\n`
      let inkScript = StringUtils.inject(SAGEdit.inkHeaderDoor, {
        id: door.id,
      })
//       let inkScript = `
// === ${door.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
      if (door.script) {
        inkScript += `\n${door.script}`
      }
      inkScript += "\n-> DONE\n"
      inkPackage[inkName] = inkScript
    }
    // Finally, set the full list of INCLUDE's
    inkPackage["_main.ink"] = mainInkWithIncludes

    return inkPackage
  }

//   public static validateScriptV1(): string[] {
//     const compilerLog: string[] = []
//     // TODO: Compile ink script and store any errors locally, so can view later
//     SAGEdit.inkCompiler = new Compiler(SAGEdit.generateInkScriptV1(), {
//       errorHandler: (msg, type) => {
//         if (type == ErrorType.Warning) console.warn(msg)
//         else console.error(msg)
//         //SAGEdit.inkCompilerLog.push(msg)
//         compilerLog.push(msg)
//       },
//       countAllVisits: true,
//       fileHandler: null,
//       pluginNames: [],
//       sourceFilename: null,
//     })
//     // Capture compile errors
//     // compiler.OnError = (msg, type) => {
//     //   if (type == ErrorType.Warning) console.warn(msg)
//     //   else console.error(msg)
//     // }
//     try {
//       SAGEdit.inkStory = SAGEdit.inkCompiler.Compile()
//     } catch (err) {
//       console.error(err)
//       // bail out now
//       //return
//     }

//     return compilerLog
//   }
  
//   private static generateInkScriptV1(): string {
//     // Loop through all the game elements and build a single ink script (+compile it)
//     let inkScript = ""
//     // ----------------
//     // Scenes
//     //
//     for (const scene of useSceneStore().scenes) {
//       inkScript += `
// === ${scene.id} ===
// # SCENE: ${scene.id}
// {! }`
//       if (scene.script) {
//         inkScript += `\n${scene.script}`
//       }
//       inkScript += "\n-> DONE\n"
//     }
//     // ----------------
//     // Actors
//     //
//     for (const actor of useActorStore().actors) {
//       inkScript += `
// === ${actor.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
//       if (actor.script) {
//         inkScript += `\n${actor.script}`
//       }
//       inkScript += "\n-> DONE\n"
//     }
//     // ----------------
//     // Props
//     //
//     for (const prop of usePropStore().props) {
//       inkScript += `
// === ${prop.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
//       if (prop.script) {
//         inkScript += `\n${prop.script}`
//       }
//       inkScript += "\n-> DONE\n"
//     }
//     // ----------------
//     // Doors
//     //
//     for (const door of useDoorStore().doors) {
//       inkScript += `
// === ${door.id} ===

// = init
// // TODO: setup stuff here?
// -> DONE

// = start`
//       if (door.script) {
//         inkScript += `\n${door.script}`
//       }
//       inkScript += "\n-> DONE\n"
//     }

//     //debugger
//     return inkScript
//   }

  // This update will be called by a pixi ticker and tell the scene that a tick happened
  //private static update() {
    //framesPassed: number) {
    // Let the current scene know that we updated it...
    // Just for funzies, sanity check that it exists first.
    // if (SAGEdit.currentScreen) {
    //   // Update anything that's time-base (e.g. tweens)
    //   SAGEdit.currentScreen.update() //framesPassed)
    // }

    // as I said before, I HATE the "frame passed" approach. I would rather use `Manager.app.ticker.deltaMS`
  //}
}
