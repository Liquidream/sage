import type { ActorModel } from "@/models/ActorModel"
import type { DoorModel } from "@/models/DoorModel"
import type { PropModel } from "@/models/PropModel"
import { Graphics, Sprite } from "pixi.js"
import { InputEventEmitter } from "../pixi-sageplay/screens/ui/InputEventEmitter"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

export class AdjustableDataObject {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500
  DRAG_SENSDIST = 25
  DRAG_ALPHA = 0.75

  public data!: PropModel | DoorModel | ActorModel
  public graphics!: Graphics
  public sprite!: Sprite
  public resizeSprite!: Sprite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  protected inputEvents!: InputEventEmitter
  public dragging = false
  public resizing = false

  public constructor(model: PropModel | DoorModel | ActorModel) {
    this.data = model

    this.setup()
  }

  private setup() {
    // Resize sprite
    const sprite = Sprite.from("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAABPlBMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD+AAD/AAD///8AAAAPAADzAQHU1NRDAwMcHBz6+voOEBDXAQHLAQE8PDzoAgK3AgL09PSenZ0mJyceICDm5uZ7BQWSkpIGAACMAwP6AQGZmZloaGgmAwPiAgKeAgKBCAhKAwP3AgLEAgKzAgLr6+uEhIRaWVkeHh5+Bga/BQXsAwPRAwMWAgLDw8OMjIxra2tiYWETFBQMDAxwBgZ6BQVWBQU4BAQfBATnAwM8AwMyAwO1AQHh4eHJycm3t7eampqWlpZ/f39paGgvLy+HBQU+BASyAwOWAwNNvyvSAAAAInRSTlMA8t+K9deOJBLotapyYUdEDKGchB77+NG6mIJaTDyDMC8dD+6AhAAAAp1JREFUWMOl13lTGkEQBfABBK8Qz2jug0cvUdCoiRFCAgpR431Hjea+v/8XiMOs1btbW+kG3h9WWfh+DsMsNW2C6bufup3uwX+SSA88HBo28Xl8px+qJFO9MfUno7egTk+mL9q/14+2krwZ7qfQdm4E+6PoIHe5n0Gug/AasrAAohEB+PvQm7B/jOrObDA7VYhA0n0Wg/a/oX5B4fyuQwKQsf0Hbr1TVHoRTIkagAT09PoLAOY82ssXOfk92t0WAaSMGU/A5oNXWssHs0/nBRlIDpss/BWUXgb7ZaK/0h7YDJkRBsL9V9AAY2aSAX2fgQEzwYC+z0DaIAZ4RjW3gTKQiAWeTtOULLhiGJAFGVgQBAkoT7+OEfRAmYhiBC1g+w2twAA/C63PfyUsaIHtXSqv2z6igg7I4YTInb+W8NUJGzTVhBKobtYul/0vx02i5044pi0dYH+t5nD9ypIvrFNlRwlcxf4MC9+JlrV7wGFh3e8DUAP84nu6SmtTMDdbRZuA20nP9d/uUqMANcAvz9SRs32PKnweZICD6/67zxssaACO6xf5TLKsA1Co2X74VANNQAvMefQt8lxg/qx2Wof2Lay4M8kCVitEdNaEEsBSWLD9wy9HtBUFlEJzvkJv7Pf+xyigFC69q74F5jUAn2oWbD8e0K3h50FeAAShmBcAURAArcBAwkwo74SndLwWA6TNpA5Y9eggbgUDZkQG3Pn9EbsHYyarAPDHnr9YYMiMJ0QAW9xn4PqaZwZloEGHoT4/Cyl71ZVP4gXtFxcC+bToVuCuumZQXMEvoo3FQI7ofLsFZPzrvgRUTyoUSm0Wgeu+ycpHuT4TSgE8cOhGHkTCI093Q1f3Y1/3gydnfKTD0ZfzqKvhWz/+j4XH/38M6R/vyW+9YwAAAABJRU5ErkJggg==")
    //sprite = Sprite.from("/images/ui/icon-resize.png")
    // sprite.width = 64
    // sprite.height = 64
    // debugger
    sprite.anchor.set(0.5)
    sprite.x = this.data.x + this.data.width / 2
    sprite.y = this.data.y + this.data.height / 2
    sprite.interactive = true
    sprite.visible = false // default not shown (until selected)
    this.resizeSprite = sprite

    // Resize
    this.resizeSprite.on("pointerdown", this.onResizePointerDown, this)
  }

  private onResizePointerDown() {
    // Start of drag...
    this.resizing = true
    //debugger
    SAGEdit.currentScreen.draggedResizeObj = this
    this.sprite.alpha = this.DRAG_ALPHA
  }
}
