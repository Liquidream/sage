import { Scene } from "@/pixi-sageplay/Scene"
import { Compiler, Story } from "inkjs"
//import { CompilerOptions } from "inkjs/compiler/CompilerOptions"
import { ErrorType } from "inkjs/engine/Error"
import { JsonFileHandler } from "inkjs/compiler/FileHandler/JsonFileHandler"

import type { InkList, InkListItem } from "inkjs/engine/InkList"
import { useWorldStore } from "@/stores/WorldStore"
import { DialogChoice } from "@/pixi-sageplay/Dialog"
import { SAGE } from "@/pixi-sageplay/SAGEPlay"
import { StringUtils } from "./StringUtils"
import { useSceneStore } from "@/stores/SceneStore"
import { useActorStore } from "@/stores/ActorStore"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useDoorStore } from "@/stores/DoorStore"
import { usePropStore } from "@/stores/PropStore"
import type { Prop } from "@/pixi-sageplay/Prop"

export class InkManager {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }
  
  public static inkJsonString: string
  
  private static inkStory: InstanceType<typeof Story>

  public static inkHeaderWorld: string
  public static inkHeaderScene: string
  public static inkHeaderActor: string
  public static inkHeaderProp: string
  public static inkHeaderDoor: string

  /* ********************************************************************
  * "Edit" Related
  * ********************************************************************/


  public static validateScript(): LogEntry[] {
    // Compile ink script and store any errors locally,
    // so can view later
    const compilerLog: LogEntry[] = []

    const jsonFileHandler = new JsonFileHandler(
      InkManager.generateInkScriptJsonSourcePackage()
    )

    const inkCompiler = new Compiler(
      jsonFileHandler.LoadInkFileContents("_main.ink"),
      {
        errorHandler: (msg, type) => {
          if (type == ErrorType.Warning) console.warn(msg)
          else console.error(msg)
          // TODO:?
          if (type == ErrorType.Error && msg.toUpperCase().includes("TODO:")) {
            type = ErrorTypeCustom.TODO
          }
          compilerLog.push({
            type: type,
            message: msg,
          })
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
      InkManager.generateInkScriptJsonSourcePackage()
    )

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
    InkManager.inkHeaderWorld = "=== _world ==="
    InkManager.inkHeaderScene = "=== ${id} ===\n # SCENE: ${id}\n {! }"
    InkManager.inkHeaderActor =
      "=== ${id} ===\n\n = init\n // TODO: setup stuff here?\n -> DONE\n\n= start"
      InkManager.inkHeaderProp = InkManager.inkHeaderActor
      InkManager.inkHeaderDoor = InkManager.inkHeaderActor


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

    const worldStore = useWorldStore()

    // ----------------
    // Functions
    //
    let inkName = `_functions.ink`
    let inkScript = ""
    if (worldStore.script_functions) {
      inkScript += `\n${worldStore.script_functions}`
    }
    inkPackage[inkName] = inkScript
    mainInkWithIncludes += `INCLUDE ${inkName}\n`

    // ----------------
    // World
    //
    inkName = `_world.ink`
    inkScript = InkManager.inkHeaderWorld
    // On Start
    if (worldStore.script_on_start) {
      inkScript += `\n${worldStore.script_on_start}`
    }
    inkScript += "\n-> DONE\n"
    inkPackage[inkName] = inkScript
    mainInkWithIncludes += `INCLUDE ${inkName}\n`

    // ----------------
    // Scenes
    //
    //debugger
    for (const scene of useSceneStore().scenes) {
      const inkName = `${scene.id}.ink`
      let inkScript = StringUtils.inject(InkManager.inkHeaderScene, {
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
      let inkScript = StringUtils.inject(InkManager.inkHeaderActor, {
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
      let inkScript = StringUtils.inject(InkManager.inkHeaderProp, {
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
      let inkScript = StringUtils.inject(InkManager.inkHeaderDoor, {
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

    //debugger

    return inkPackage
  }


/* ********************************************************************
 * "Play" Related
 * ********************************************************************/

  /**
   * Init the class (inc. setup of external functions)
   */
  static Initialise() {
    // TODO: Anything here?
  }

  /**
   * Create the ink story object from pre-compiled JSON data
   */
  public static async createStory(strData: string) {
     // V2 (loading pre-compiled ink story)
     InkManager.inkStory = new Story(strData)

    // Now story exists, we can bind external functions
    InkManager.inkStory.BindExternalFunction("ext_pickup_prop",
      function(propId: string){ 
        debugger

        // TODO: REFACTOR THIS to call some common Pickup Prop method 
        //       (would say Prop.Pickup(), but getting Prop obj is currently v. hard!!!)

        console.debug(">>> ext_pickup_prop...")
        let msg = `pickup ${propId}`
        console.debug(msg)
        if (propId) { 
          const propModel = SAGE.World.getPropById(propId)
          SAGE.Dialog.showMessage(`You picked up the ${propModel.name}`)
          // If prop is in current scene, remove it
          if (SAGE.World.currentScene.id == propModel.location_id)
          {
            // Find prop obj (needed to actually remove from scene - if present)
            const index = SAGE.World.currentScene.screen.props.findIndex(
              (item) => item.model.id === propId
            )
            let prop: Prop | undefined
            if (index !== -1) prop = SAGE.World.currentScene.screen.props.splice(index, 1)[0]
            if (prop) {
              SAGE.World.currentScene.screen.removeProp(prop, true, true)
            }
          }
          // Add to Player's inventory
          SAGE.World.player.addToInventory(propModel)
          // Play sound
          SAGE.Sound.play("SFX-PickUp")
          // Auto-open player inventory
          SAGE.invScreen.open(true)
        }
        //return msg
        //return "twelve o'clock"; 
      }
    );
  }

  /**
   * Continues the ink story (if it can)
   */
  public static async chooseStoryPath(path: string) {
    try {
      InkManager.inkStory.ChoosePathString(path)
      //SAGE.inkStory.ChoosePathString("Prisoner.main_jail")
      InkManager.continueStory()
    } catch (error) {
      console.error(`>>> Error choosing story path (${path}): ` + error)
    }
  }

  /**
   * Continues the ink story (if it can)
   */
  private static async continueStory() {
    try {
      // Generate story text - loop through available content
      while (InkManager.inkStory.canContinue) {
        // Get ink to generate the next paragraph
        let paragraphText = InkManager.inkStory.Continue()
        if (paragraphText == null) {
          break // No more story text (for now)
        }
        // ----------------------------------
        // Parse current story line...
        //
        // remove trailing line break (likely to be present)
        paragraphText = paragraphText.trim()
        // Actor specified?
        let actorId = ""
        if (paragraphText.indexOf(": ") > 0) {
          const dialogArray = paragraphText.split(": ")
          actorId = dialogArray[0]
          paragraphText = dialogArray[1]
        }
        // do we have tags?
        if (InkManager.inkStory.currentTags?.length > 0) {
          const tags = InkManager.inkStory.currentTags
          console.debug(tags)
          //tags.forEach(async (tag, index) => {
          for (let tag of tags) {
            // -------------------------------------------
            // Scene?
            if (tag.toUpperCase().startsWith("SCENE")) {
              // Get target scene name (same as knot - but Ink doesn't expose that!)
              let target_scene_id = tag.split(":")[1].trim()
              const targetSceneModel = SAGE.World.getSceneById(target_scene_id)
              if (targetSceneModel) {
                const targetScene: Scene = new Scene(targetSceneModel)
                await targetScene.show()
              }
            }
            // TODO: other tags...
            if (tag.startsWith("CLOSEUP_ON")) {
              // Get target actor/object name
              let target_id = tag.split(":")[1].trim()
              SAGE.World.currentScene.closeUpOn(target_id)
            }
            if (tag.startsWith("CLOSEUP_OFF")) {
              // Get target actor/object name
              let target_id = tag.split(":")[1].trim()
              SAGE.World.currentScene.stopCloseUp(target_id)
            }
          }
        }
        // -----------------------------------

        //console.debug(paragraphText)
        if (paragraphText) {
          //console.debug(paragraphText)
          await SAGE.Dialog.say(actorId, paragraphText)
        }
      }

      // Dialog choices..?
      if (InkManager.inkStory.currentChoices.length > 0) {
        //console.debug(InkManager.inkStory.currentChoices)
        const dialogChoices: DialogChoice[] = []
        for (const choice of InkManager.inkStory.currentChoices) {
          dialogChoices.push(
            new DialogChoice(choice.text, async () => {
              InkManager.inkStory.ChooseChoiceIndex(choice.index)
              SAGE.Dialog.end()
              InkManager.continueStory()
            })
          )
        }

        await SAGE.Dialog.showChoices(dialogChoices, {
          suppressChoiceSelectRepeat: true, // Let ink syntax handle this!
        })
      }
    } catch (error) {
      console.error(">>> Error choosing story path: " + error)
    }
  }

  public static restoreSavedState(inkStoryJson: string) {
    // TODO: Need to load last saved state
    // (+restore inventory, world, scene, actor, prop object states accordingly)
    //const lastState = SAGE.World.player.gameState
    if (inkStoryJson && inkStoryJson.length > 0) {
      //debugger
      InkManager.inkStory.state.LoadJson(inkStoryJson)
      console.log("-- Inventory contents:")
      const invList = InkManager.inkStory.variablesState["Inventory"] as InkList
      //debugger
      invList.orderedItems.forEach(({Key, Value}) => {
        console.log(`>> ${Key.itemName}`)
        const propName = Key.itemName?.replace("prp_", "")
        // Add to Player's inventory
        if (propName) { 
          const propModel = SAGE.World.getPropById(propName)
          SAGE.World.player.addToInventory(propModel)
        }
      })
    }
  }
}


export enum ErrorTypeCustom {
  Author = 0,
  Warning = 1,
  Error = 2,
  TODO = 99, // PN custom
}

export interface LogEntry {
  type: ErrorTypeCustom
  message: string
}
