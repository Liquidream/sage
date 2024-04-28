import { Scene } from "@/pixi-sageplay/Scene"
import { Story } from "inkjs"
import type { InkList, InkListItem } from "inkjs/engine/InkList"

export class InkManager {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

    // Initialise InkJS (this might not be the right place...)
    private static inkStory: InstanceType<typeof Story>
    //private static inkCompiler: InstanceType<typeof Compiler>

    /**
   * Continues the ink story (if it can)
   */
  public static async createStory(strData: string) {
     // V2 (loading pre-compiled ink story)
     InkManager.inkStory = new Story(strData)
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
        console.debug(InkManager.inkStory.currentChoices)
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

  public static restoreSavedState() {
    // TODO: Need to load last saved state
    // (+restore inventory, world, scene, actor, prop object states accordingly)
    const lastState = SAGE.World.player.gameState
    if (lastState.jsonState && lastState.jsonState.length > 0) {
      InkManager.inkStory.state.LoadJson(lastState.jsonState)
      console.log("-- Inventory contents:")
      const invList = InkManager.inkStory.variablesState["Inventory"] as InkList
      //debugger
      invList.orderedItems.forEach(({Key, Value}) => {
        console.log(`>> ${Key.itemName}`)
        const propName = Key.itemName.replace("prp_", "")
        // Add to Player's inventory
        const propModel = SAGE.World.getPropById(propName)
        if (propName) SAGE.World.player.addToInventory(propModel)
      })
    }
  }

}
