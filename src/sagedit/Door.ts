import { DoorState, type DoorModel } from "@/models/DoorModel"
import { SAGEdit } from "@/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { Graphics, Sprite } from "pixi.js"
import { Easing, Tween } from "tweedle.js"
//import { DialogType } from "./Dialog"
//import * as DoorData from "./DoorData"
import { InputEventEmitter } from "./ui/InputEventEmitter"

export class Door {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500

  public doorModel!: DoorModel //DoorData.IDoorData
  public graphics!: Graphics
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private doorInputEvents!: InputEventEmitter

  public constructor(doorModel: DoorModel) {
    //DoorData.IDoorData) {
    // Initialise from data object
    this.doorModel = doorModel
    const graphics = new Graphics()
    const doorWidth = this.doorModel.width || 0,
      doorHeight = this.doorModel.height || 0

    // Set the fill color
    graphics.beginFill(0xffff00, 0.25) // light yellow

    // Selected Prop?
    const worldStore = useWorldStore()
    if (worldStore.currDoorId === this.doorModel.id) {
      graphics.lineStyle(10, 0xff0000) // Red
    } else {
      graphics.lineStyle(10, 0x000000, 0) // "Invisible"
    }

    // Make doors visible in debug
    // if (SAGEdit.debugMode) {
    //   // Set the fill color
    //   graphics.beginFill(0xe74c3c, 125) // light red
    //   // Line/stroke style
    //   graphics.lineStyle(10, 0xff0000) // Red
    // } else {
    //   // Set the fill color to barely visible
    //   // (else won't get collision hit)
    //   // TODO: find a nicer solution to this!
    //   graphics.beginFill(0xccc, 0.00000000000001) // "Invisible"
    // }

    // Make a center point of origin (anchor)
    graphics.pivot.set(doorWidth / 2, doorHeight / 2)
    // Draw a rectangle
    graphics.drawRoundedRect(
      this.doorModel.x || 0,
      this.doorModel.y || 0,
      this.doorModel.width || 0,
      this.doorModel.height || 0,
      30
    )
    // Applies fill to lines and shapes since the last call to beginFill.
    graphics.endFill()

    // Events
    this.doorInputEvents = new InputEventEmitter(graphics)
    graphics.on("primaryaction", this.onPrimaryAction, this)
    // graphics.on("secondaryaction", this.onSecondaryAction, this)
    // Hover (info)
    graphics.on("pointerover", this.onPointerOver, this)
    graphics.on("pointerout", this.onPointerOut, this)
    //
    //SAGE.Events.on("scenehint", this.onSceneHint, this)

    this.graphics = graphics
  }

  public unlockDoor() {
    // Unlock the door
    this.doorModel.state = DoorState.Unlocked
    // Play sound
    if (this.doorModel.playSounds) {
      //SAGE.Sound.play("Unlock-Door")
    }
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.graphics.removeAllListeners()
    //SAGE.Events.off("scenehint", this.onSceneHint, this)
  }

  private onSceneHint() {
    // Show attract tween for this
    const attractShine: Sprite = Sprite.from("UI-Shine")
    attractShine.anchor.set(0.5)
    attractShine.x = this.doorModel.x || 0
    attractShine.y = this.doorModel.y || 0
    attractShine.alpha = 0

    this.graphics.parent.addChild(attractShine)

    new Tween(attractShine)
      .to({ alpha: 1 }, 500)
      .easing(Easing.Quadratic.InOut)
      .yoyo(true)
      .repeat(1)
      .start()
      .onComplete(() => {
        this.graphics.parent.removeChild(attractShine)
      })
  }

  private onPointerOver() {
    if (SAGEdit.debugMode)
      console.log(`${this.doorModel.name}::onPointerOver()`)
    //SAGE.Dialog.showMessage(this.data.name, DialogType.Caption, -1)
  }

  private onPointerOut() {
    // If dialog being displayed is name "on hover"...
    // if (SAGE.Dialog.currentDialogType === DialogType.Caption) {
    //   SAGE.Dialog.clearMessage()
    // }
  }

  private onPrimaryAction() {
    if (SAGEdit.debugMode)
      console.log(
        `door > target_scene_id: ${this.doorModel.target_scene_id}, state:${this.doorModel.state}`
      )

    // Select clicked door
    const worldStore = useWorldStore()
    if (worldStore.currDoorId != this.doorModel.id) {
      worldStore.currDoorId = this.doorModel.id
      worldStore.currPropId = ""
    } else {
      //
    }
    // Check door state
    // if (this.data.state == DoorState.Locked) {
    //   // Does player have the key?
    //   const key = SAGE.World.player.inventory.find((obj) => {
    //     return obj.id === this.data.key_prop_id
    //   })
    //   if (this.data.auto_unlock && key) {
    //     // Unlock the door
    //     this.unlockDoor()
    //     // Remove item from inventory (unless not single-use)
    //     if (key.single_use) {
    //       SAGE.World.player.removeFromInventory(key.id)
    //     }
    //   } else {
    //     SAGE.Dialog.showMessage(this.data.desc_locked || "It is locked")
    //     // Play sound
    //     if (this.data.playSounds) {
    //       SAGE.Sound.play("Locked-Door")
    //     }
    //     return
    //   }
  }

  //   // TODO: Find the target door/scene
  //   // const first: {id: number; language: string;} | undefined
  //   const targetScene = SAGE.World.scenes.find((obj) => {
  //     return obj.id === this.data.target_scene_id
  //   })

  //   if (targetScene) {
  //     // Change scene to the game scene!
  //     targetScene.show()
  //   }
  //   // Custom action?
  //   else if (this.data.on_action) {
  //     Function(this.data.on_action)()
  //     return
  //   } else {
  //     SAGE.Dialog.showErrorMessage(
  //       `Error: Scene with ID '${this.data.target_scene_id}' is invalid`
  //     )
  //   }
  // }

  // private onSecondaryAction() {
  //   if (SAGE.debugMode) console.log(`onSecondaryAction for :${this.data.id}`)
  //   SAGE.Dialog.showMessage(this.data.desc)
  // }
}
