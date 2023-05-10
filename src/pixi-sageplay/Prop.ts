import { Sprite, Texture } from "pixi.js"
import { Easing, Tween } from "tweedle.js"
import { SAGE } from "./SAGEPlay"
import { DialogType } from "./Dialog"
import { InputEventEmitter } from "./screens/ui/InputEventEmitter"
//import type { IPropData } from "./data/PropData"
import type { PropModel } from "@/models/PropModel"

export class Prop {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_SENSDIST = 25
  DRAG_ALPHA = 0.75

  //public data!: IPropData
  public model: PropModel

  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private propInputEvents!: InputEventEmitter
  public dragging = false

  public constructor(inModel: PropModel) {
    // Initialise from data object
    this.model = inModel

    let sprite = undefined
    if (inModel.image) {
      sprite = Sprite.from(inModel.image)
    } else {
      sprite = new Sprite(Texture.EMPTY)
      sprite.width = inModel.width || 0
      sprite.height = inModel.height || 0
    }
    this.sprite = sprite
    sprite.width = inModel.width || 0
    sprite.height = inModel.height || 0
    sprite.anchor.set(0.5)
    sprite.x = inModel.x || 0
    sprite.y = inModel.y || 0

    // Events
    this.propInputEvents = new InputEventEmitter(this.sprite)
    this.sprite.on("primaryaction", this.onPrimaryAction, this)
    this.sprite.on("secondaryaction", this.onSecondaryAction, this)
    // Hover (info)
    this.sprite.on("pointerover", this.onPointerOver, this)
    this.sprite.on("pointerout", this.onPointerOut, this)
    // Drag+Drop
    this.sprite.on("pointerdown", this.onPointerDown, this)
    //
    SAGE.Events.on("scenehint", this.onSceneHint, this)

    // visible state
    this.sprite.visible = inModel.visible //|| true // default to visible, unless otherwise specified
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.sprite.removeAllListeners()
    SAGE.Events.off("scenehint", this.onSceneHint, this)
  }

  public async use(object: any) {
    let validUse = false
    // Run any OnEnter action?
    if (this.model.on_use) {
      validUse = await SAGE.Script.safeExecFuncWithParams(
        this.model.on_use,
        this,
        object
      )
    }
    SAGE.debugLog(`Use case valid? ${validUse}`)
    if (validUse) {
      // Valid use-case
    } else {
      // Invalid, so restore position
      // (if not already in inventory)
      if (!this.inInventory) {
        this.sprite.x = this.model.x || 0
        this.sprite.y = this.model.y || 0
      }
    }
  }

  public destroy() {
    if (this.inInventory) {
      SAGE.World.player.removeFromInventory(this.model.id)
    } else {
      SAGE.World.currentScene.screen.removeProp(this, true)
    }
  }

  /** Returns whether or not the this prop is in player's inventory */
  public get inInventory(): boolean {
    return SAGE.World.player.inventory.some(
      (prop) => prop.id === this.model.id
    )
  }

  private onSceneHint() {
    // Show attract tween for this
    // (...but abort if in player inventory!)
    if (this.inInventory) return
    const attractShine: Sprite = Sprite.from("UI-Shine")
    attractShine.anchor.set(0.5)
    attractShine.x = this.model.x || 0
    attractShine.y = this.model.y || 0
    attractShine.alpha = 0

    this.sprite.parent.addChild(attractShine)

    new Tween(attractShine)
      .to({ alpha: 1 }, 500)
      .easing(Easing.Quadratic.InOut)
      .yoyo(true)
      .repeat(1)
      .start()
      .onComplete(() => {
        this.sprite.parent.removeChild(attractShine)
      })
  }

  private onPointerDown() {
    //debugger
    //_e: InteractionEvent
    // On an inventory (or draggable) item?
    if (this.inInventory || this.model.draggable) {
      // Start of drag...
      this.dragging = true
      SAGE.World.currentScene.screen.draggedProp = this
      this.sprite.alpha = this.DRAG_ALPHA
      SAGE.Dialog.clearMessage()
      // Disable auto-close of inventory
      SAGE.invScreen.autoClose = false
    }
  }

  private onPointerOver() {
    //_e: InteractionEvent
    SAGE.Dialog.showMessage(this.model.name, DialogType.Caption, -1)
  }

  private onPointerOut() {
    //_e: InteractionEvent
    // If dialog being displayed is name "on hover"...
    // (AND not dragging this Prop)
    if (
      SAGE.Dialog.currentDialogType === DialogType.Caption &&
      !this.dragging
    ) {
      SAGE.Dialog.clearMessage()
    }
  }

  private onPrimaryAction() {
    SAGE.debugLog(`You interacted with a prop! (${this.model.name})`)
    // Custom action?
    if (this.model.on_action) {
      Function(this.model.on_action)()
      return
    }
    // Can prop be picked up?
    // (...and not already in inventory)?
    if (this.model.pickupable && !this.inInventory) {
      SAGE.Dialog.showMessage(`You picked up the ${this.model.name}`)
      // Remove prop from scene
      SAGE.World.currentScene.screen.removeProp(this, true, true)
      // Add to Player's inventory
      SAGE.World.player.addToInventory(this.model)
      // Play sound
      SAGE.Sound.play("SFX-PickUp")
      // Auto-open player inventory
      SAGE.invScreen.open(true)
      return
    }
    // Interacted while in player inventory?
    // ...if so, perform secondary action (describe)
    if (this.inInventory) {
      this.onSecondaryAction()
      // Disable auto-close of inventory
      SAGE.invScreen.autoClose = false
      return
    }
  }

  private onSecondaryAction() {
    SAGE.debugLog(`onSecondaryAction for :${this.model.id}`)
    if (this.model.desc) {
      SAGE.Dialog.showMessage(this.model.desc)
    }
  }
}
