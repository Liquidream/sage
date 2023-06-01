/*
import { SAGE } from "./SAGEPlay"
import type { Door } from "./Door"
import type { Prop } from "./Prop"
import { DialogChoice } from "./Dialog"

// --- Sounds ---
// "Stream, Water, C.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
// "Pick up Item 1.wav" by SilverIllusionist of Freesound.org
// "Water drips in the cave HQ.wav" by tosha73
// "SnakeAttackVerbPuls.wav" by Jamius
// "bush11.wav" by schademans
// "Jingle_Win_00.wav" by LittleRobotSoundFactory
// --- Icons ---
// https://www.flaticon.com/free-icons/backpack - Backpack icons created by bqlqn
// https://www.flaticon.com/free-icons/settings - Settings icons created by Pixel perfect
// https://www.flaticon.com/free-icon/expand_1124606

export class Actions {
  onStart = async () => {
    // Debug testing
    //SAGE.World.revealPropAt("prp_key", "scn_fortress_ext")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onKeyUse = async (keyProp: Prop, onObj: any): Promise<boolean> => {
    // Confirm key prop used on correct target
    if (onObj.model.id === "dor_fortress_int") {
      const door = onObj as Door
      door.unlockDoor()
      keyProp.destroy()
      return true
    }
    return false
  }

  onCaveTunnelEnter = async () => {
    if (SAGE.World.currentScene.firstVisit) {
      await SAGE.Script.wait(1)
      SAGE.Sound.play("Snake-Attack")
      await SAGE.Script.wait(1)
      if (SAGE.World.player.hasPropInInventory("prp_rat")) {
        SAGE.debugLog("Safe! Snake ate the rat...")
        SAGE.Dialog.showMessage("A snake strikes and eats the rat & leaves")
        SAGE.World.player.removeFromInventory("prp_rat")
      } else {
        SAGE.debugLog("Player died...")
        SAGE.Dialog.showMessage("A hungry snake strikes and bites you")
        await SAGE.Script.wait(1)
        SAGE.gameOver("You Died!")
      }
    }
  }

  onPitAction = async () => {
    SAGE.Dialog.showMessage("You fall into the bottomless pit...")
    await SAGE.Script.wait(1)
    SAGE.gameOver("You Died!")
  }

  onTreeAction = async () => {
    const treeProp = SAGE.World.getPropById("prp_tree")
    // If not collected key already...
    if (treeProp && !treeProp.property["key-dropped"]) {
      treeProp.property["key-dropped"] = true
      SAGE.Sound.play("Bush-Rustle")
      await SAGE.Dialog.showMessage("You give the tree a shake...")
      SAGE.Sound.play("Key-Clink")
      SAGE.World.revealPropAt("prp_key", "scn_promontory")
      await SAGE.Script.wait(1)
      SAGE.Dialog.showMessage("A Key fell out of the tree")
    }
  }

  onBridgeEnter = async () => {
    if (SAGE.World.player.hasPropInInventory("prp_gold")) {
      SAGE.debugLog("Got gold out - game won!")
      SAGE.gameWon("You paid the King's Ransom!")
    }

    //SAGE.Sound.playLoop("Test-Loop", false);

    // if (!SAGE.World.property["intro-done"]) {
    //   SAGE.World.property["intro-done"] = true;
    //   await SAGE.Script.wait(3);
    //   await SAGE.Dialog.say("Narrator", "The King has been kidnapped by marauders, who are keeping him hostage", "#00ff00", "Intro-1");
    //   await SAGE.Dialog.say("Narrator", "Your task is a simple one...", undefined, "Intro-2")
    //   await SAGE.Dialog.say("Narrator", "Retrieve the gold\nthat will pay the King's Ransom!", undefined, "Intro-3")
    // }

    // await SAGE.Script.wait(3);
    //await this.testDialogOptions();
  }

  async testDialogOptions() {
    await SAGE.Dialog.showChoices(
      [
        // new DialogChoice("Why did you bring me here?", async () => {
        //   await SAGE.Dialog.say("Narrator", "I'm lonely...", "Lime");
        //   SAGE.Dialog.property["asked_why"] = true;
        // }),
        new DialogChoice("Where am i?", async () => {
          await SAGE.Dialog.say(
            "Narrator",
            "You're in Paul's demo adventure",
            "Lime"
          )
          SAGE.Dialog.property["asked_why"] = true
        }),
        new DialogChoice(
          "Who are you?",
          async () => {
            await SAGE.Dialog.say(
              "Narrator",
              "I'm the narrator, of course!",
              "Lime"
            )
          },
          "asked_why"
        ),
        new DialogChoice("Nevermind", async () => {
          await SAGE.Dialog.say("Narrator", "Fine, be like that!", "Lime")
          SAGE.Dialog.end()
        }),
      ]
      //, { col: "red", suppressChoiceSelectRepeat: true }
    )
  }
}
*/