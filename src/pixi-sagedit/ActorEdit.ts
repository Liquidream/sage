import { Assets, Graphics, Sprite, Texture } from "pixi.js"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import type { ActorModel } from "@/models/ActorModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { AdjustableDataObject } from "@/pixi-sagedit/screens/ui/AdjustableDataObject"

export class ActorEdit extends AdjustableDataObject {
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
    super(actorModel)

    this.data = actorModel
    this.graphics = inGraphics
  }

  public async initialize() {
    // init base content
    await this.setup()

    // Initialise from data object
    let sprite = undefined
    if (this.data.image) {
      const imgBase64 = this.data.image

      const texture = await Assets.load(imgBase64)
      //const base = new BaseTexture(imgBase64)
      console.log(
        `>> model dimensions: width=${this.data.width} height=${this.data.height}`
      )
      //const texture = new Texture(base)
      sprite = Sprite.from(texture)

    } else {
      sprite = new Sprite(Texture.EMPTY)
    }
    this.sprite = sprite

    this.updateSelectionState(useWorldStore().currActorId === this.data.id)

    sprite.width = this.data.width || 0
    sprite.height = this.data.height || 0

    sprite.anchor.set(0.5)
    sprite.x = this.data.x || 0
    sprite.y = this.data.y || 0

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
    // Listen for id/data changes
    SAGEdit.Events.on("sceneIdRenamed", (oldSceneId: string, newSceneId: string) => {
        this.updateSceneIdChanged(oldSceneId, newSceneId)
      },
      this
    )

    // visible state
    if (!this.data.visible) {
      this.sprite.alpha = 0.5
    }
    //this.sprite.visible = propModel.visible // || true
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.sprite.removeAllListeners()
    this.resizeSprite.removeAllListeners()
  }

  public destroy() {
    // if (this.inInventory) {
    //   SAGE.World.player.removeFromInventory(this.data.id)
    // } else {
    //SAGEdit.currentScreen.removeProp(this, true)
    //   SAGE.World.currentScene.screen.removeProp(this, true)
    // }
  }

  private updateSceneIdChanged(oldSceneId: string, newSceneId: string) {
    // Rename all references of oldSceneId > newSceneId in current instance
    // (store will react to handle all other instances)
    const actorModel = this.data as ActorModel
    if (actorModel.location_id === oldSceneId) {
      actorModel.location_id = newSceneId
    }
  }

  private updateSelectionState(isSelected: boolean) {
    this.selected = isSelected
    this.graphics.clear()
    const actorWidth = this.data.width || 0,
    actorHeight = this.data.height || 0
    // v8 do before stroke
    this.graphics.roundRect(0, 0, actorWidth, actorHeight, 30)
    if (isSelected) {
      this.graphics.stroke({ width: 10, color: "red" }) // Red
    } else {
      this.graphics.stroke({ width: 0, color: 0x00000000000001 }) // "Invisible"
    }
    // Set Graphics "canvas" to correct pos/width
    // (So we can easily move it when "dragging")
    this.graphics.x = this.data.x || 0
    this.graphics.y = this.data.y || 0
    this.graphics.width = actorWidth
    this.graphics.height = actorHeight
    this.graphics.pivot.set(actorWidth / 2, actorHeight / 2)
    //}
    //this.graphics.endFill()
    // Other UI
    if (this.resizeSprite) this.resizeSprite.visible = isSelected
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
