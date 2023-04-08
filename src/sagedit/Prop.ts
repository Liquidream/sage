import { BaseTexture, Sprite, Texture } from "pixi.js"
import { InputEventEmitter } from "./ui/InputEventEmitter"
import type { PropModel } from "@/models/PropModel"
import { SAGEdit } from "@/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"

export class Prop {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_SENSDIST = 25
  DRAG_ALPHA = 0.75

  public data!: PropModel
  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private propInputEvents!: InputEventEmitter
  public dragging = false

  public constructor(propModel: PropModel) {
    // Initialise from data object
    let sprite = undefined
    if (propModel.image) {
      const imgBase64 = propModel.image
      const base = new BaseTexture(imgBase64)
      console.log(
        `>> model dimensions: width=${propModel.width} height=${propModel.height}`
      )
      // base.on("loaded", () => {
      //   console.log(
      //     `>> base LOADED dimensions: width=${base.width} height=${base.height}`
      //   )
      // ##### don't do this here
      // ##### instead, set at point of IMPORTING (to allow overriding)
      // if (base.width > 0) {
      //   propModel.width = base.width
      //   propModel.height = base.height
      // }
      //})
      // Do it here also, in case texture is cached (so loaded won't fire)
      // if (base.width > 0) {
      //   propModel.width = base.width
      //   propModel.height = base.height
      // }
      const texture = new Texture(base)
      sprite = Sprite.from(texture)
    } else {
      sprite = new Sprite(Texture.EMPTY)
      sprite.width = propModel.width || 0
      sprite.height = propModel.height || 0
    }
    this.data = propModel
    this.sprite = sprite
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
    //
    //SAGE.Events.on("scenehint", this.onSceneHint, this)

    // visible state
    this.sprite.visible = propModel.visible || true
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
