import { BaseTexture, Graphics, Sprite, Texture } from "pixi.js"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import type { ActorModel } from "@/models/ActorModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"

export class ActorEdit {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_SENSDIST = 25
  DRAG_ALPHA = 0.75

  public data!: ActorModel
  public graphics!: Graphics
  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private propInputEvents!: InputEventEmitter
  public dragging = false

  public constructor(actorModel: ActorModel, inGraphics: Graphics) {
    // Initialise from data object
    let sprite = undefined
    if (actorModel.image) {
      const imgBase64 = actorModel.image
      const base = new BaseTexture(imgBase64)
      console.log(
        `>> model dimensions: width=${actorModel.width} height=${actorModel.height}`
      )
      const texture = new Texture(base)
      sprite = Sprite.from(texture)
    } else {
      sprite = new Sprite(Texture.EMPTY)
    }
    this.data = actorModel
    this.graphics = inGraphics
    this.sprite = sprite

    this.updateSelectionState(useWorldStore().currActorId === actorModel.id)

    sprite.width = actorModel.width || 0
    sprite.height = actorModel.height || 0

    sprite.anchor.set(0.5)
    sprite.x = actorModel.x || 0
    sprite.y = actorModel.y || 0

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
    if (!actorModel.visible) {
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
    this.graphics.clear()
    const actorWidth = this.data.width || 0,
      actorHeight = this.data.height || 0
    if (isSelected) {
      this.graphics.lineStyle(10, 0xff0000) // Red
    } else {
      this.graphics.lineStyle(10, 0x000000, 0) // "Invisible"
    }
    // Set Graphics "canvas" to correct pos/width
    // (So we can easily move it when "dragging")
    this.graphics.x = this.data.x || 0
    this.graphics.y = this.data.y || 0
    this.graphics.width = actorWidth
    this.graphics.height = actorHeight
    this.graphics.pivot.set(actorWidth / 2, actorHeight / 2)
    this.graphics.drawRoundedRect(0, 0, actorWidth, actorHeight, 30)
    //}
    this.graphics.endFill()
  }

  private onPointerDown() {
    // Select clicked actor
    const worldStore = useWorldStore()
    if (worldStore.currActorId != this.data.id) {
      worldStore.currActorId = this.data.id
      worldStore.currPropId = ""
      worldStore.currDoorId = ""
    } else {
      // Start of drag...
      this.dragging = true
      //debugger
      SAGEdit.currentScreen.draggedActor = this
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
