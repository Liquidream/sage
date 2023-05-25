import { BaseTexture, Graphics, Sprite, Texture } from "pixi.js"
import { Easing, Tween } from "tweedle.js"
import { SAGE } from "./SAGEPlay"
import { DialogType } from "./Dialog"
import { DoorState, type DoorModel } from "@/models/DoorModel"
//import * as DoorData from "./data/DoorData"
import { InputEventEmitter } from "./screens/ui/InputEventEmitter"
import { Scene } from "./Scene"

export class Door {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500

  //public data!: DoorData.IDoorData
  public model: DoorModel
  public graphics!: Graphics
  public sprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private doorInputEvents!: InputEventEmitter

  public constructor(doorData: DoorModel) {
    // Initialise from data object
    this.model = doorData

    // ---------------------------------------
    // Door Graphics
    //
    const graphics = new Graphics()
    // Make doors visible in debug
    if (SAGE.debugMode) {
      // Set the fill color
      graphics.beginFill(0xe74c3c, 125) // Red
      // Line/stroke style
      graphics.lineStyle(10, 0xff0000)
    } else {
      // Set the fill color to barely visible
      // (else won't get collision hit)
      // TODO: find a nicer solution to this!
      graphics.beginFill(0xccc, 0.00000000000001) // "Invisible"
    }
    if (this.model && this.model.width && this.model.height) {
      // Make a center point of origin (anchor)
      graphics.pivot.set(this.model.width / 2, this.model.height / 2)
      // Draw a rectangle
      graphics.drawRoundedRect(
        this.model.x || 0,
        this.model.y || 0,
        this.model.width,
        this.model.height,
        30
      )
    }
    // Applies fill to lines and shapes since the last call to beginFill.
    graphics.endFill()

    // Events
    this.doorInputEvents = new InputEventEmitter(graphics)
    graphics.on("primaryaction", this.onPrimaryAction, this)
    graphics.on("secondaryaction", this.onSecondaryAction, this)
    // Hover (info)
    graphics.on("pointerover", this.onPointerOver, this)
    graphics.on("pointerout", this.onPointerOut, this)
    //
    SAGE.Events.on("scenehint", this.onSceneHint, this)

    this.graphics = graphics

    // ---------------------------------------
    // Door Sprite
    //
    let sprite = undefined
    if (this.model.image) {
      sprite = Sprite.from(this.model.image)
    } else {
      sprite = new Sprite(Texture.EMPTY)
      sprite.width = this.model.width || 0
      sprite.height = this.model.height || 0
    }
    this.sprite = sprite
    sprite.anchor.set(0.5)
    sprite.x = this.model.x || 0
    sprite.y = this.model.y || 0
    // visible state
    this.sprite.visible = this.model.visible // || true
  }

  public unlockDoor() {
    // Unlock the door
    this.model.state = DoorState.Unlocked
    // Play sound
    if (this.model.playSounds) {
      SAGE.Sound.play("SFX-DoorUnlock")
    }
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.graphics.removeAllListeners()
    SAGE.Events.off("scenehint", this.onSceneHint, this)
  }

  private onSceneHint() {
    // Show attract tween for this
    const attractShine: Sprite = Sprite.from("UI-Shine")
    attractShine.anchor.set(0.5)
    attractShine.x = this.model.x || 0
    attractShine.y = this.model.y || 0
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
    //_e: InteractionEvent
    if (SAGE.debugMode) console.log(`${this.model.name}::onPointerOver()`)
    SAGE.Dialog.showMessage(this.model.name, DialogType.Caption, -1)
  }

  private onPointerOut() {
    //_e: InteractionEvent
    // If dialog being displayed is name "on hover"...
    if (SAGE.Dialog.currentDialogType === DialogType.Caption) {
      SAGE.Dialog.clearMessage()
    }
  }

  private onPrimaryAction() {
    //debugger
    if (SAGE.debugMode)
      console.log(
        `door > target_scene_id: ${this.model.target_scene_id}, state:${this.model.state}`
      )
    // Check door state
    if (this.model.state == DoorState.Locked) {
      // Does player have the key?
      const key = SAGE.World.player.inventory.find((obj) => {
        return obj.id === this.model.key_prop_id
      })
      if (this.model.auto_unlock && key) {
        // Unlock the door
        this.unlockDoor()
        // Remove item from inventory (unless not single-use)
        if (key.single_use) {
          SAGE.World.player.removeFromInventory(key.id)
        }
      } else {
        SAGE.Dialog.showMessage(this.model.desc_locked || "It is locked")
        // Play sound
        if (this.model.playSounds) {
          SAGE.Sound.play("SFX-DoorLocked")
        }
        return
      }
    }

    // TODO: Find the target door/scene
    // const first: {id: number; language: string;} | undefined
    const targetSceneModel = SAGE.World.scenes.find((obj) => {
      return obj.id === this.model.target_scene_id
    })

    if (targetSceneModel) {
      // Change scene to the game scene!
      const targetScene: Scene = new Scene(targetSceneModel)
      targetScene.show()
    }
    // Custom action?
    else if (this.model.on_action) {
      SAGE.Script.safeExecFunc(this.model.on_action)
      //Function(this.model.on_action)()
      return
    } else {
      SAGE.Dialog.showErrorMessage(
        `Error: Scene with ID '${this.model.target_scene_id}' is invalid`
      )
    }
  }

  private onSecondaryAction() {
    if (SAGE.debugMode) console.log(`onSecondaryAction for :${this.model.id}`)
    if (this.model.desc) SAGE.Dialog.showMessage(this.model.desc)
  }
}
