import type { DoorModel } from "@/models/DoorModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { BaseTexture, Graphics, Sprite, Texture } from "pixi.js"
import { Easing, Tween } from "tweedle.js"
//import { DialogType } from "./Dialog"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"

export class DoorEdit {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_ALPHA = 0.75

  public data!: DoorModel
  public graphics!: Graphics
  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private doorInputEvents!: InputEventEmitter
  public dragging = false

  public constructor(doorModel: DoorModel) {
    //DoorData.IDoorData) {
    // Initialise from data object
    this.data = doorModel

    // ---------------------------------------
    // Door Graphics
    //
    const graphics = new Graphics()
    const doorWidth = doorModel.width || 0,
      doorHeight = doorModel.height || 0
    // Set the fill color
    graphics.beginFill(0xffff00, 0.25) // light yellow
    // Selected Prop?
    const worldStore = useWorldStore()
    if (worldStore.currDoorId === doorModel.id) {
      graphics.lineStyle(10, 0xff0000) // Red
    } else {
      graphics.lineStyle(10, 0x000000, 0) // "Invisible"
    }
    // Set Graphics "canvas" to correct pos/width
    // (So we can easily move it when "dragging")
    graphics.x = doorModel.x || 0
    graphics.y = doorModel.y || 0
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

    // ---------------------------------------
    // Door Sprite
    //
    let sprite = undefined
    if (doorModel.image) {
      const imgBase64 = doorModel.image
      const base = new BaseTexture(imgBase64)
      console.log(
        `>> model dimensions: width=${doorModel.width} height=${doorModel.height}`
      )
      const texture = new Texture(base)
      sprite = Sprite.from(texture)
    } else {
      sprite = new Sprite(Texture.EMPTY)
      sprite.width = doorModel.width || 0
      sprite.height = doorModel.height || 0
    }
    this.sprite = sprite
    sprite.anchor.set(0.5)
    sprite.x = doorModel.x || 0
    sprite.y = doorModel.y || 0
    // visible state
    if (!doorModel.visible) {
      this.sprite.alpha = 0.5
    }
    // this.sprite.visible = doorModel.visible // || true
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.graphics.removeAllListeners()
  }

  private onSceneHint() {
    // Show attract tween for this
    const attractShine: Sprite = Sprite.from("UI-Shine")
    attractShine.anchor.set(0.5)
    attractShine.x = this.data.x || 0
    attractShine.y = this.data.y || 0
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
    if (SAGEdit.debugMode) console.log(`${this.data.name}::onPointerOver()`)
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
    if (worldStore.currDoorId == this.data.id) {
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
        `door > target_scene_id: ${this.data.target_scene_id}, state:${this.data.state}`
      )

    // Select clicked door
    const worldStore = useWorldStore()
    if (worldStore.currDoorId != this.data.id) {
      worldStore.currDoorId = this.data.id
      worldStore.currPropId = ""
    } else {
      //
    }
  }
}
