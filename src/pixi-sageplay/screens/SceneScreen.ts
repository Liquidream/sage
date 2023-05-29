import { Group, Tween } from "tweedle.js" //Easing
import {
  Container,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  Texture,
  FederatedPointerEvent,
  Point,
  BaseTexture,
  VideoResource,
  BlurFilter,
} from "pixi.js" //filters

import { SAGE, type IScreen } from "../SAGEPlay"
import type { Scene } from "../Scene"
import { InputEventEmitter } from "./ui/InputEventEmitter"
import { Collision } from "../../utils/Collision"
import { Prop } from "../Prop"
import { Door } from "../Door"
import type { PropModel } from "@/models/PropModel"
import { Actor } from "../Actor"
import type { ActorModel } from "@/models/ActorModel"

export class SceneScreen extends Container implements IScreen {
  private scene: Scene
  private backdrop!: Sprite
  private props: Array<Prop> = []
  private propsCloseups: Array<Actor> = []
  private doors: Array<Door> = []
  private actors: Array<Actor> = []
  private actorsCloseups: Array<Actor> = []

  public draggedProp!: Prop | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dragTarget!: any // Could be Prop or Door
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public touchTarget!: any // Could be Prop or Door

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private backdropInputEvents!: InputEventEmitter

  // Filters
  private blurFilter: BlurFilter

  constructor(scene: Scene) {
    super()

    // Ref to scene data
    this.scene = scene

    // perform initial setup
    this.setup()
  }

  private setup() {
    SAGE.debugLog("SceneScreen : setup()...")

    // Construct scene from data
    this.buildBackdrop()
    this.buildDoorways()
    this.buildProps()
    this.buildActors()

    // Setup filters
    this.blurFilter = new BlurFilter(0) // 8 = default strength
    // default to NO blur
    SAGE.backLayer.filters = [this.blurFilter]

    // Fade in scene music
    if (this.scene.sound) {
      SAGE.Sound.playLoop(this.scene.sound, true)
    }

    // Drag+Drop support
    SAGE.app.stage.interactive = true
    SAGE.app.stage.on("pointermove", this.onPointerMove, this)
    SAGE.app.stage.on("pointerup", this.onPointerUp, this)
    SAGE.app.stage.on("touchmove", this.onTouchMove, this)
  }

  public update() {
    //{(_framesPassed: number): void {
    // Do any movement here...

    //You need to update a group for the tweens to do something!
    Group.shared.update()
  }

  public tidyUp(restartGame?: boolean) {
    SAGE.debugLog(`>> SceneScreen tidyUp()`)
    // Unsubscribe from events, etc.
    for (const prop of this.props) {
      prop.tidyUp()
    }
    for (const door of this.doors) {
      door.tidyUp()
    }
    SAGE.app.stage.off("pointermove", this.onPointerMove, this)
    SAGE.app.stage.off("pointerup", this.onPointerUp, this)
    SAGE.app.stage.off("touchmove", this.onTouchMove, this)

    // Fade out scene music
    if (this.scene.sound) {
      SAGE.Sound.stop(this.scene.sound, !restartGame)
    }
  }

  public setDepthOfField(isEnabled: boolean) {
    if (isEnabled) {
      // Make backdrop "unfocused"
      //debugger
      const blurTween = new Tween(this.blurFilter).to({ blur: 8 }, 500).start()
    } else {
      // Remove blur (re-focus backdrop)
      const blurTween = new Tween(this.blurFilter).to({ blur: 0 }, 500).start()
    }
  }

  public showGameWon(message: string) {
    this.showGameEndScreen(message, "Press to Play again", 0x00e436)
  }

  public showGameOver(message: string) {
    this.showGameEndScreen(message, "Press to Restart", 0xbe1226)
  }

  private onPointerMove(_e: FederatedPointerEvent) {
    SAGE.debugLog(`${this.name}::onPointerMove()`)
    if (this.draggedProp) {
      // Temp remove interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = false
      // Update pos
      this.draggedProp.sprite.x = _e.data.global.x
      this.draggedProp.sprite.y = _e.data.global.y
      // Check for valid "drop"
      this.checkDragCollisions()
    }
  }

  private onPointerUp() {
    //_e: FederatedPointerEvent) {
    SAGE.debugLog(`${this.name}::onPointerUp()`)
    if (this.draggedProp) {
      // We were dragging something - did we drop it on something?
      if (this.dragTarget) {
        // Was it a valid object?
        this.draggedProp.use(this.dragTarget)
      } else {
        // Didn't drop on object, so... do nothing? (+put back to orig pos)
        this.draggedProp.sprite.x = this.draggedProp.model.x || 0
        this.draggedProp.sprite.y = this.draggedProp.model.y || 0
      }
      // End Drag+Drop mode
      this.draggedProp.dragging = false
      // Restore interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = true
      this.draggedProp.sprite.alpha = 1
      this.draggedProp = undefined
      // Update inventory (in case it was an inventory prop)
      SAGE.invScreen.update()
    }
  }

  private onTouchMove(_e: FederatedPointerEvent) {
    SAGE.debugLog(`${this.name}::onTouchMove()`)
    // Get touch position
    const touchPoint: Point = new Point()
    _e.data.getLocalPosition(this, touchPoint, _e.data.global)
    // Check for any collisions...
    const result = this.checkTouchCollisions(touchPoint)
    if (result) {
      if (this.touchTarget) this.touchTarget.onPointerOver()
      else SAGE.Dialog.clearMessage()
    }
  }

  private checkDragCollisions() {
    // Check selected/dragged Prop with
    let currTarget = undefined
    //  > Other Props in inventory
    for (const prop of SAGE.invScreen.propsList) {
      if (
        Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)
      ) {
        SAGE.debugLog(`>> collided with ${prop.model.name}`)
        currTarget = prop
      }
    }
    //  > Other Props in current scene
    for (const prop of this.props) {
      if (
        Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)
      ) {
        SAGE.debugLog(`>> collided with ${prop.model.name}`)
        currTarget = prop
      }
    }
    //  > Doors in current scene
    for (const door of this.doors) {
      if (
        Collision.isCollidingObjToObj(this.draggedProp?.sprite, door.graphics)
      ) {
        SAGE.debugLog(`>> collided with ${door.model.name}`)
        currTarget = door
      }
    }

    // If collision, then highlight source AND target
    // (...and remember if "dropped" on it)
    if (currTarget !== this.dragTarget) {
      if (currTarget) {
        // Different target...
        SAGE.debugLog(`>> new target = ${currTarget.model.name}`)
      } else {
        // Lost target
        SAGE.debugLog(`>> NO target`)
      }
      this.dragTarget = currTarget
    }
  }

  private checkTouchCollisions(touchPoint: Point): boolean {
    // Check selected/dragged Prop with
    let currTarget = undefined
    //  > Other Props in inventory
    for (const prop of SAGE.invScreen.propsList) {
      if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.model.name}`)
        currTarget = prop
      }
    }
    //  > Other Props in current scene
    for (const prop of this.props) {
      if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.model.name}`)
        currTarget = prop
      }
    }
    //  > Doors in current scene
    for (const door of this.doors) {
      if (Collision.isCollidingPointToObj(touchPoint, door.graphics)) {
        SAGE.debugLog(`>> collided with ${door.model.name}`)
        currTarget = door
      }
    }

    // If collision, then highlight source AND target
    // (...and remember if "dropped" on it)
    if (currTarget !== this.touchTarget) {
      if (currTarget) {
        // Different target...
        SAGE.debugLog(`>> new target = ${currTarget.model.name}`)
      } else {
        // Lost target
        SAGE.debugLog(`>> NO target`)
      }
      this.touchTarget = currTarget
      return true
    }
    return false
  }

  /**
   * Start the player death/game over sequence
   * @param message The message to display to player
   */
  private showGameEndScreen(
    message: string,
    actionMessage: string,
    backgroundColour: number
  ): void {
    // Red overlay
    const overlay = new Graphics()
    overlay.beginFill(backgroundColour)
    overlay.alpha = 0
    overlay.drawRect(0, 0, SAGE.width, SAGE.height)
    overlay.endFill()
    overlay.interactive = true // Super important or the object will never receive mouse events!
    overlay.on("pointertap", this.onClickGameOver, this)
    this.addChild(overlay)
    // Animate it...
    new Tween(overlay)
      .to({ alpha: 0.8 }, 1000)
      .start()
      .onComplete(() => {
        // Now show action message
        const style = new TextStyle({
          fill: "white",
          fontFamily: "Impact",
          fontSize: 48,
          lineJoin: "round",
          padding: 4,
          strokeThickness: 10,
          trim: true,
        })
        const text = new Text(actionMessage, style)
        text.anchor.set(0.5)
        text.x = SAGE.width / 2
        text.y = SAGE.height / 1.5
        overlay.addChild(text)
      })
    // "Game Over"
    const style = new TextStyle({
      fill: "white",
      fontFamily: "Impact",
      fontSize: 120,
      lineJoin: "round",
      padding: 4,
      strokeThickness: 10,
      trim: true,
    })
    const text = new Text(message, style)
    text.anchor.set(0.5)
    text.x = SAGE.width / 2
    text.y = SAGE.height / 2
    overlay.addChild(text)
  }

  private onClickGameOver() {
    //_e: InteractionEvent
    // Restart game
    SAGE.restartGame()
  }

  private async buildBackdrop() {
    // Backdrop
    let sprite = new Sprite(Texture.EMPTY)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const mode = urlParams.get("mode")

    if (this.scene.image) {
      if (mode == "play") {
        // Is it a video?
        if (this.scene?.image.includes("data:video")) {
          // Load video data
          const element = document.createElement("video")
          element.src = this.scene.image // e.g. "data:video/mp4;base64,xxxxxx"
          element.preload = "auto"
          element.loop = true

          const resource = new VideoResource(element)
          const texture = Texture.from(resource)
          sprite = Sprite.from(texture)
          sprite.width = SAGE.width
          sprite.height = SAGE.height
        } else {
          // When in play/test mode - need to handle non-preloaded images
          const base = new BaseTexture(this.scene.image)
          const texture = new Texture(base)
          sprite = Sprite.from(texture)
          //
          //-----
          if (base.valid) {
            // (Only called if prev loaded image is re-loaded)
            const viewRatio = SAGE.width / SAGE.height //1.77
            const imageRatio = sprite.width / sprite.height
            if (imageRatio < viewRatio) {
              sprite.width = SAGE.width
              sprite.height = sprite.width / imageRatio
            } else {
              sprite.height = SAGE.height
              sprite.width = sprite.height * imageRatio
            }
          } else {
            // ...else grab dimensions one texture fully loaded
            base.on("loaded", () => {
              // debugger
              const viewRatio = SAGE.width / SAGE.height //1.77
              const imageRatio = sprite.width / sprite.height
              if (imageRatio < viewRatio) {
                sprite.width = SAGE.width
                sprite.height = sprite.width / imageRatio
              } else {
                sprite.height = SAGE.height
                sprite.width = sprite.height * imageRatio
              }
            })
          }
        }
      } else {
        // When in "release" mode, all images should've been preloaded, so go ahead
        // create a video texture from a path
        const texture = Texture.from(this.scene.image)
        // create a new Sprite using the video texture (yes it's that easy)
        sprite = new Sprite(texture)
        //sprite = Sprite.from(this.scene.image)

        // Video?
        if (texture.baseTexture?.resource?.autoPlay) {
          texture.baseTexture.resource.source.loop = true
        }

        const viewRatio = SAGE.width / SAGE.height //1.77
        const imageRatio = sprite.width / sprite.height
        if (imageRatio < viewRatio) {
          sprite.width = SAGE.width
          sprite.height = sprite.width / imageRatio
        } else {
          sprite.height = SAGE.height
          sprite.width = sprite.height * imageRatio
        }
      }
    }
    sprite.anchor.set(0.5)
    sprite.x = SAGE.width / 2
    sprite.y = SAGE.height / 2

    this.addChild(sprite)
    this.backdrop = sprite

    // Events
    this.backdropInputEvents = new InputEventEmitter(this.backdrop)
    this.backdrop.on("primaryaction", this.onPrimaryAction, this)
    this.backdrop.on("secondaryaction", this.onSecondaryAction, this)
  }

  private buildProps() {
    if (this.scene.props.length > 0) {
      for (const propData of this.scene.props) {
        this.addProp(propData)
      }
    }

    SAGE.Dialog.clearMessage()
  }

  public addProp(model: PropModel, fadeIn = false) {
    // Create new component obj (contains data + view)
    const prop = new Prop(model)
    this.addChild(prop.sprite)
    this.props.push(prop)
    // Don't add to scene.propdata here, as it likely already came from it?

    // Fade in?
    if (fadeIn) {
      prop.sprite.alpha = 0
      new Tween(prop.sprite).to({ alpha: 1 }, 500).start()
    }

    // DEBUG?
    if (SAGE.debugMode) {
      console.log(`prop.propModel.width = ${prop.model.width}`)
      const graphics = new Graphics()
      const propWidth = prop.model.width || 0,
        propHeight = prop.model.height || 0
      graphics.beginFill(0xe74c3c, 125) // Red
      graphics.lineStyle(10, 0xff0000)
      graphics.pivot.set(propWidth / 2, propHeight / 2)
      // Need to handle diff for "non-image" sprites
      // (as Graphics scaling goes screwy if image dimensions are not really there)
      if (prop.model.image) {
        graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
        prop.sprite.addChild(graphics)
      } else {
        graphics.drawRoundedRect(
          prop.model.x || 0,
          prop.model.y || 0,
          propWidth,
          propHeight,
          30
        )
        this.addChild(graphics)
      }
      graphics.endFill()
    }
  }

  /**
   * Removes a Prop from a scene (default = fade out).
   */
  removeProp(prop: Prop, fadeOut = true, scaleAnim?: boolean) {
    if (fadeOut) {
      new Tween(prop.sprite)
        .to({ alpha: 0 }, 500)
        .start()
        .onComplete(() => {
          // https://bobbyhadz.com/blog/typescript-this-implicitly-has-type-any
          // remove when tween completes
          this.removeChild(prop.sprite)
          const index = this.props.findIndex(
            (item) => item.model.id === prop.model.id
          )
          if (index !== -1) this.props.splice(index, 1)
          prop.tidyUp()
          // remove from game data
          this.scene.removePropModelById(prop.model.id)
        })
    }
    if (scaleAnim) {
      new Tween(prop.sprite.scale).to({ x: 1.5, y: 1.5 }, 500).start()
    }
  }

  private buildDoorways() {
    if (this.scene.doors.length > 0) {
      for (const doorData of this.scene.doors) {
        // Create new component obj (contains data + view)
        const door = new Door(doorData)
        this.addChild(door.sprite)
        this.addChild(door.graphics)
        this.doors.push(door)
      }
    }
    SAGE.Dialog.clearMessage()
  }

  private buildActors() {
    if (this.scene.actors.length > 0) {
      for (const actorData of this.scene.actors) {
        this.addActor(actorData)
      }
    }

    SAGE.Dialog.clearMessage()
  }

  public addActor(model: ActorModel, fadeIn = false) {
    // Create new component obj (contains data + view)
    const actor = new Actor(model)
    this.addChild(actor.sprite)
    this.actors.push(actor)
    // Don't add to scene.propdata here, as it likely already came from it?

    // Fade in?
    if (fadeIn) {
      actor.sprite.alpha = 0
      new Tween(actor.sprite).to({ alpha: 1 }, 500).start()
    }

    // DEBUG?
    if (SAGE.debugMode) {
      console.log(`actor.model.width = ${actor.model.width}`)
      const graphics = new Graphics()
      const actorWidth = actor.model.width || 0,
        actorHeight = actor.model.height || 0
      graphics.beginFill(0xe74c3c, 125) // Red
      graphics.lineStyle(10, 0xff0000)
      graphics.pivot.set(actorWidth / 2, actorHeight / 2)
      // Need to handle diff for "non-image" sprites
      // (as Graphics scaling goes screwy if image dimensions are not really there)
      if (actor.model.image) {
        graphics.drawRoundedRect(0, 0, actorWidth, actorHeight, 30)
        actor.sprite.addChild(graphics)
      } else {
        graphics.drawRoundedRect(
          actor.model.x || 0,
          actor.model.y || 0,
          actorWidth,
          actorHeight,
          30
        )
        this.addChild(graphics)
      }
      graphics.endFill()
    }
  }

  /**
   * Removes an Actor from a scene (default = fade out).
   */
  removeActor(actor: Actor, fadeOut = true, scaleAnim?: boolean) {
    if (fadeOut) {
      new Tween(actor.sprite)
        .to({ alpha: 0 }, 500)
        .start()
        .onComplete(() => {
          // https://bobbyhadz.com/blog/typescript-this-implicitly-has-type-any
          // remove when tween completes
          this.removeChild(actor.sprite)
          const index = this.actors.findIndex(
            (item) => item.model.id === actor.model.id
          )
          if (index !== -1) this.actors.splice(index, 1)
          actor.tidyUp()
          // remove from game data
          this.scene.removeActorModelById(actor.model.id)
        })
    }
    if (scaleAnim) {
      new Tween(actor.sprite.scale).to({ x: 1.5, y: 1.5 }, 500).start()
    }
  }

  public addActorCloseup(model: ActorModel, fadeIn = false) {
    // Check to see whether actor already exists in scene
    let actor: Actor
    const existingActor = this.actors.filter((a) => a.model.id === model.id)[0]
    if (existingActor) {
      actor = existingActor
    } else {
      // Create new component obj (contains data + view)
      actor = new Actor(model)
    }

    SAGE.midLayer.addChild(actor.sprite_closeup)
    this.actorsCloseups.push(actor)

    // Fade in?
    if (fadeIn) {
      actor.sprite_closeup.alpha = 0
      //const blurTween = new Tween(this.blurFilter).to({ blur: 8 }, 500).start()
      new Tween(actor.sprite).to({ alpha: 0 }, 500).start()
      new Tween(actor.sprite_closeup).to({ alpha: 1 }, 500).start()
    }
  }

  /**
   * Removes an Actor from closeup (default = fade out).
   */
  removeActorCloseup(actor: Actor, fadeOut = true) {
    // Remove from list first (so can exit depth of field if last one)
    const index = this.actorsCloseups.findIndex(
      (item) => item.model.id === actor.model.id
    )
    if (index !== -1) this.actorsCloseups.splice(index, 1)
    //
    if (fadeOut) {
      new Tween(actor.sprite_closeup)
        .to({ alpha: 0 }, 500)
        .start()
        .onComplete(() => {
          SAGE.midLayer.removeChild(actor.sprite_closeup)
        })
      new Tween(actor.sprite).to({ alpha: 1 }, 500).start()
    }
  }

  public addPropCloseup(model: PropModel, fadeIn = false) {
    // Check to see whether prop already exists in scene
    let prop: Prop
    const existingProp = this.props.filter((p) => p.model.id === model.id)[0]
    if (existingProp) {
      prop = existingProp
    } else {
      // Create new component obj (contains data + view)
      prop = new Prop(model)
    }

    SAGE.midLayer.addChild(prop.sprite_closeup)
    this.propsCloseups.push(prop)

    // Fade in?
    if (fadeIn) {
      prop.sprite_closeup.alpha = 0
      new Tween(prop.sprite_closeup).to({ alpha: 1 }, 500).start()
    }
  }

  /**
   * Removes an Prop from closeup (default = fade out).
   */
  removePropCloseup(prop: Prop, fadeOut = true) {
    // Remove from list first (so can exit depth of field if last one)
    const index = this.propsCloseups.findIndex(
      (item) => item.model.id === prop.model.id
    )
    if (index !== -1) this.propsCloseups.splice(index, 1)
    //
    if (fadeOut) {
      new Tween(prop.sprite_closeup)
        .to({ alpha: 0 }, 500)
        .start()
        .onComplete(() => {
          // https://bobbyhadz.com/blog/typescript-this-implicitly-has-type-any
          // remove when tween completes
          SAGE.midLayer.removeChild(prop.sprite_closeup)
        })
    }
  }

  private onPrimaryAction() {
    //_e: InteractionEvent
    SAGE.debugLog("Backdrop was clicked/tapped")
    SAGE.Events.emit("sceneinteract")
  }

  private onSecondaryAction() {
    //_e: InteractionEvent
    // Make all interactive objects flash (by raising 'global' event)");
    SAGE.Events.emit("scenehint")
  }
}
