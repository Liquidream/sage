import { BaseTexture, Graphics, Sprite, Texture } from "pixi.js"
import type { PropModel } from "@/models/PropModel"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"
import { useWorldStore } from "@/stores/WorldStore"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import { AdjustableDataObject } from "@/pixi-sageplay/screens/ui/AdjustableDataObject"

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

    sprite.width = propModel.width || 0
    sprite.height = propModel.height || 0
    sprite.anchor.set(0.5)
    sprite.x = propModel.x || 0
    sprite.y = propModel.y || 0

    // Resize sprite
    // sprite = Sprite.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAABPlBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD+AAD/AAD///8AAAAPAADzAQHU1NRDAwMcHBz6+voOEBDXAQHLAQE8PDzoAgK3AgL09PSenZ0mJyceICDm5uZ7BQWSkpIGAACMAwP6AQGZmZloaGgmAwPiAgKeAgKBCAhKAwP3AgLEAgKzAgLr6+uEhIRaWVkeHh5+Bga/BQXsAwPRAwMWAgLDw8OMjIxra2tiYWETFBQMDAxwBgZ6BQVWBQU4BAQfBATnAwM8AwMyAwO1AQHh4eHJycm3t7eampqWlpZ/f39paGgvLy+HBQU+BASyAwOWAwNNvyvSAAAAInRSTlMA8t+K9deOJBLotapyYUdEDKGchB77+NG6mIJaTDyDMC8dD+6AhAAAAp1JREFUWMOl13lTGkEQBfABBK8Qz2jug0cvUdCoiRFCAgpR431Hjea+v/8XiMOs1btbW+kG3h9WWfh+DsMsNW2C6bufup3uwX+SSA88HBo28Xl8px+qJFO9MfUno7egTk+mL9q/14+2krwZ7qfQdm4E+6PoIHe5n0Gug/AasrAAohEB+PvQm7B/jOrObDA7VYhA0n0Wg/a/oX5B4fyuQwKQsf0Hbr1TVHoRTIkagAT09PoLAOY82ssXOfk92t0WAaSMGU/A5oNXWssHs0/nBRlIDpss/BWUXgb7ZaK/0h7YDJkRBsL9V9AAY2aSAX2fgQEzwYC+z0DaIAZ4RjW3gTKQiAWeTtOULLhiGJAFGVgQBAkoT7+OEfRAmYhiBC1g+w2twAA/C63PfyUsaIHtXSqv2z6igg7I4YTInb+W8NUJGzTVhBKobtYul/0vx02i5044pi0dYH+t5nD9ypIvrFNlRwlcxf4MC9+JlrV7wGFh3e8DUAP84nu6SmtTMDdbRZuA20nP9d/uUqMANcAvz9SRs32PKnweZICD6/67zxssaACO6xf5TLKsA1Co2X74VANNQAvMefQt8lxg/qx2Wof2Lay4M8kCVitEdNaEEsBSWLD9wy9HtBUFlEJzvkJv7Pf+xyigFC69q74F5jUAn2oWbD8e0K3h50FeAAShmBcAURAArcBAwkwo74SndLwWA6TNpA5Y9eggbgUDZkQG3Pn9EbsHYyarAPDHnr9YYMiMJ0QAW9xn4PqaZwZloEGHoT4/Cyl71ZVP4gXtFxcC+bToVuCuumZQXMEvoo3FQI7ofLsFZPzrvgRUTyoUSm0Wgeu+ycpHuT4TSgE8cOhGHkTCI093Q1f3Y1/3gydnfKTD0ZfzqKvhWz/+j4XH/38M6R/vyW+9YwAAAABJRU5ErkJggg==")
    // //sprite = Sprite.from("/images/ui/icon-resize.png")
    // // sprite.width = 64
    // // sprite.height = 64
    // // debugger
    // sprite.anchor.set(0.5)
    // sprite.x = propModel.x + propModel.width/2
    // sprite.y = propModel.y + propModel.height/2
    // sprite.interactive = true
    // sprite.visible = false // default not shown (until selected)
    // this.resizeSprite = sprite

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

    // visible state
    if (!propModel.visible) {
      this.sprite.alpha = 0.5
    }
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
