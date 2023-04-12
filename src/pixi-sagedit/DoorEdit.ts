import type { DoorModel } from "@/models/DoorModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { Graphics, Sprite } from "pixi.js"
import { Easing, Tween } from "tweedle.js"
//import { DialogType } from "./Dialog"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"

export class DoorEdit {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_ALPHA = 0.75

  public doorModel!: DoorModel
  public graphics!: Graphics
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private doorInputEvents!: InputEventEmitter
  public dragging = false

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

    // Set Graphics "canvas" to correct pos/width
    // (So we can easily move it when "dragging")
    graphics.x = this.doorModel.x || 0
    graphics.y = this.doorModel.y || 0
    graphics.width = doorWidth
    graphics.height = doorHeight

    // Make a center point of origin (anchor)
    graphics.pivot.set(doorWidth / 2, doorHeight / 2)

    // Draw a rectangle
    // (graphics "canvas" are already in position/width)
    graphics.drawRoundedRect(0, 0, doorWidth, doorHeight, 30)

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
    graphics.on("pointerdown", this.onPointerDown, this)
    //SAGE.Events.on("scenehint", this.onSceneHint, this)

    this.graphics = graphics
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.graphics.removeAllListeners()
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

  private onPointerDown() {
    // Select clicked door
    const worldStore = useWorldStore()
    if (worldStore.currDoorId == this.doorModel.id) {
      // Start of drag...
      this.dragging = true
      //debugger
      SAGEdit.currentScreen.draggedDoor = this
      this.graphics.alpha = this.DRAG_ALPHA
    }
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
  }
}
