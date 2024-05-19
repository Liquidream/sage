import { Assets, Graphics, Sprite, Texture } from "pixi.js"
import type { PropModel } from "@/models/PropModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import { AdjustableDataObject } from "@/pixi-sagedit/screens/ui/AdjustableDataObject"

export class PropEdit extends AdjustableDataObject {
  // "constants"
  // (perhaps overridable in config?)
  // TOUCH_DURATION = 500
  // DRAG_SENSDIST = 25
  // DRAG_ALPHA = 0.75

  // public data!: PropModel
  // public graphics!: Graphics
  // public sprite!: Sprite
  // public resizeSprite!: Sprite
  // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore (ignore the "declared but never used" for now)
  // private propInputEvents!: InputEventEmitter
  // public dragging = false
  // public resizing = false

  public constructor(propModel: PropModel, inGraphics: Graphics) {
    super(propModel)

    // Initialise from data object
    let sprite = undefined
    if (propModel.image) {
      const imgBase64 = propModel.image
      // Workaround for awaiting async call in constructor
      // https://stackoverflow.com/a/50885340/574415
      ;(async () => {
          const base = await Assets.load(imgBase64)
        //const base = new BaseTexture(imgBase64)
        console.log(
          `>> model dimensions: width=${propModel.width} height=${propModel.height}`
        )
        const texture = new Texture(base)
        sprite = Sprite.from(texture)
      })()
    } else {
      sprite = new Sprite(Texture.EMPTY)
    }
    this.data = propModel
    this.graphics = inGraphics
    this.sprite = sprite

    sprite.width = propModel.width || 0
    sprite.height = propModel.height || 0
    sprite.anchor.set(0.5)
    sprite.x = propModel.x || 0
    sprite.y = propModel.y || 0

    this.updateSelectionState(useWorldStore().currPropId === propModel.id)

    // Events
    this.inputEvents = new InputEventEmitter(this.sprite)
    // this.sprite.on("primaryaction", this.onPrimaryAction, this)
    // this.sprite.on("secondaryaction", this.onSecondaryAction, this)
    // Hover (info)
    this.sprite.on("pointerover", this.onSpritePointerOver, this)
    this.sprite.on("pointerout", this.onSpritePointerOut, this)
    // Drag+Drop
    this.sprite.on("pointerdown", this.onSpritePointerDown, this)

    // Resize
    //this.resizeSprite.on("pointerdown", this.onResizePointerDown, this)

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
    if (!propModel.visible) {
      this.sprite.alpha = 0.5
    }
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
    const propModel = this.data as PropModel
    if (propModel.location_id === oldSceneId) {
      propModel.location_id = newSceneId
    }
  }

  private updateSelectionState(isSelected: boolean) {
    //debugger
    this.selected = isSelected
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
    this.graphics.x = this.data.x || 0
    this.graphics.y = this.data.y || 0
    this.graphics.width = propWidth
    this.graphics.height = propHeight
    this.graphics.pivot.set(propWidth / 2, propHeight / 2)
    this.graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
    //}
    this.graphics.endFill()
    // Other UI
    if (this.resizeSprite) this.resizeSprite.visible = isSelected
  }

  private onSpritePointerDown() {
    // Select clicked prop
    const worldStore = useWorldStore()
    if (worldStore.currPropId != this.data.id) {
      worldStore.currPropId = this.data.id
      worldStore.currDoorId = ""
      worldStore.currActorId = ""
    } else {
      // Start of drag...
      this.dragging = true
      console.log("start drag more")
      //debugger
      SAGEdit.currentScreen.draggedProp = this
      this.sprite.alpha = this.DRAG_ALPHA
    }
  }

  // private onResizePointerDown() {
  //   // Select clicked prop
  //   // const worldStore = useWorldStore()
  //   // if (worldStore.currPropId != this.data.id) {
  //   //   worldStore.currPropId = this.data.id
  //   //   worldStore.currDoorId = ""
  //   //   worldStore.currActorId = ""
  //   // } else {
  //     // Start of drag...
  //     this.resizing = true
  //     //debugger
  //     SAGEdit.currentScreen.draggedResizeObj = this
  //     this.sprite.alpha = this.DRAG_ALPHA
  //   //}
  // }


  private onSpritePointerOver() {
    //SAGE.Dialog.showMessage(this.data.name, DialogType.Caption, -1)
  }

  private onSpritePointerOut() {
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
