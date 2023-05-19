import { BaseTexture, Graphics, Sprite, Texture } from "pixi.js"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import type { PropModel } from "@/models/PropModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"

export class PropEdit {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_SENSDIST = 25
  DRAG_ALPHA = 0.75

  public data!: PropModel
  public graphics!: Graphics
  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private propInputEvents!: InputEventEmitter
  public dragging = false

  public constructor(propModel: PropModel, inGraphics: Graphics) {
    // Initialise from data object
    let sprite = undefined
    if (propModel.image) {
      const imgBase64 = propModel.image
      const base = new BaseTexture(imgBase64)
      console.log(
        `>> model dimensions: width=${propModel.width} height=${propModel.height}`
      )
      const texture = new Texture(base)
      sprite = Sprite.from(texture)
    } else {
      sprite = new Sprite(Texture.EMPTY)
    }
    this.data = propModel
    this.graphics = inGraphics
    this.sprite = sprite

    this.updateSelectionState(useWorldStore().currPropId === propModel.id)

    sprite.width = propModel.width || 0
    sprite.height = propModel.height || 0

    sprite.anchor.set(0.5)
    sprite.x = propModel.x || 0
    sprite.y = propModel.y || 0

    // Events
    this.propInputEvents = new InputEventEmitter(this.sprite)
    // this.sprite.on("primaryaction", this.onPrimaryAction, this)
    // this.sprite.on("secondaryaction", this.onSecondaryAction, this)
    // Hover (info)
    this.sprite.on("pointerover", this.onPointerOver, this)
    this.sprite.on("pointerout", this.onPointerOut, this)
    // Drag+Drop
    this.sprite.on("pointerdown", this.onPointerDown, this)

    // Listen for selection changes
    SAGEdit.Events.on("selectionChanged", (selectedId: string) => {
        //debugger
        this.updateSelectionState(selectedId == this.data.id)
      },
      this
    )

    // visible state
    if (!propModel.visible) {
      this.sprite.alpha = 0.5
    }
    //this.sprite.visible = propModel.visible // || true
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.sprite.removeAllListeners()
  }

  public destroy() {
    // if (this.inInventory) {
    //   SAGE.World.player.removeFromInventory(this.data.id)
    // } else {
    //SAGEdit.currentScreen.removeProp(this, true)
    //   SAGE.World.currentScene.screen.removeProp(this, true)
    // }
  }

  private updateSelectionState(isSelected: boolean) {
    //debugger
    this.graphics.clear()
    const propWidth = this.data.width || 0,
      propHeight = this.data.height || 0
    if (isSelected) {
      this.graphics.lineStyle(10, 0xff0000) // Red
    } else {
      this.graphics.lineStyle(10, 0x000000, 0) // "Invisible"
    }
    // Set Graphics "canvas" to correct pos/width
    // (So we can easily move it when "dragging")
    // graphics.x = propModel.x || 0
    // graphics.y = propModel.y || 0
    // graphics.width = propWidth
    // graphics.height = propHeight
    // graphics.pivot.set(propWidth / 2, propHeight / 2)
    this.graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
    //}
    this.graphics.endFill()
  }

  private onPointerDown() {
    // Select clicked prop
    const worldStore = useWorldStore()
    if (worldStore.currPropId != this.data.id) {
      worldStore.currPropId = this.data.id
      worldStore.currDoorId = ""
    } else {
      // Start of drag...
      this.dragging = true
      //debugger
      SAGEdit.currentScreen.draggedProp = this
      this.sprite.alpha = this.DRAG_ALPHA
    }
  }

  private onPointerOver() {
    //SAGE.Dialog.showMessage(this.data.name, DialogType.Caption, -1)
  }

  private onPointerOut() {
    // If dialog being displayed is name "on hover"...
    // (AND not dragging this Prop)
    // if (
    //   SAGE.Dialog.currentDialogType === DialogType.Caption &&
    //   !this.dragging
    // ) {
    //   SAGE.Dialog.clearMessage()
    // }
  }
}
