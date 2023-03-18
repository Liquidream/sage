import { Group, Tween } from "tweedle.js" //Easing
import {
  Container,
  Graphics,
  InteractionEvent,
  Point,
  Sprite,
  TextStyle,
  Texture,
  Text,
  BaseTexture,
} from "pixi.js"

//import { useSceneStore } from "@/stores/SceneStore"

import { SAGEdit } from "@/SAGEdit"
//import type { ISceneData } from "../sage/Scene"
import { Prop } from "@/sagedit/Prop"
//import { Door } from "@/sagedit/Door"
//import type { SceneData } from "@/sagedit/SceneData"
//import type { PropData } from "@/sagedit/PropData"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneModel } from "@/models/SceneModel"
import { useSceneStore } from "@/stores/SceneStore"
import { usePropStore } from "@/stores/PropStore"
import type { PropModel } from "@/models/PropModel"

export class SceneScreen extends Container {
  private dialogText!: Text | null

  private scene: SceneModel | undefined
  private backdrop!: Sprite
  private props: Array<Prop> = []
  //private doors: Array<Door> = []

  public draggedProp!: Prop | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dragTarget!: any // Could be Prop or Door
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public touchTarget!: any // Could be Prop or Door

  constructor() {
    super()

    // Subscribe to World state changes so that we refresh/recreate Pixi.js content
    const worldStore = useWorldStore()
    this.scene = worldStore.getCurrentScene
    //.$subscribe((mutation, state) => {
    worldStore.$subscribe(() => {
      // Current scene changed
      SAGEdit.debugLog("World changed - so refresh scene model (pixi)")
      this.scene = worldStore.getCurrentScene
      this.refresh()
    })

    // Subscribe to Scene state changes so that we refresh/recreate Pixi.js content
    const sceneStore = useSceneStore()
    //.$subscribe((mutation, state) => {
    sceneStore.$subscribe(() => {
      // Scene changed
      //if (this.scene?.id !== worldStore.currSceneId) {
      SAGEdit.debugLog("Scene changed - so refresh scene model (pixi)")
      this.refresh()
    })

    // Subscribe to Prop state changes so that we refresh/recreate Pixi.js content
    const propStore = usePropStore()
    //.$subscribe((mutation, state) => {
    propStore.$subscribe(() => {
      SAGEdit.debugLog("Prop changed - so refresh scene model (pixi)")
      this.refresh()
    })

    // perform initial setup
    this.setup()
  }

  refresh() {
    this.teardown()
    this.setup()
  }

  setup() {
    SAGEdit.debugLog("SceneScreen : setup()...")

    // Construct scene from data
    this.buildBackdrop()
    // this.buildDoorways()
    this.buildProps()

    // Create text
    const styly: TextStyle = new TextStyle({
      align: "center",
      fill: "#fff",
      fontSize: 47,
      strokeThickness: 6,
      lineJoin: "round",
      wordWrap: true,
      wordWrapWidth: 1280 / 2,
    })
    this.dialogText = new Text(this.scene?.name, styly) // Text supports unicode!
    this.dialogText.x = 800
    this.dialogText.y = 300
    this.dialogText.anchor.set(0.5)
    // .text = "This is expensive to change, please do not abuse";
    this.addChild(this.dialogText)
    //SAGEdit.app.stage.addChild(this.dialogText)

    // Drag+Drop support
    SAGEdit.app.stage.interactive = true
    SAGEdit.app.stage.on("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.on("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.on("touchmove", this.onTouchMove, this)
  }

  teardown() {
    SAGEdit.debugLog(`>> SceneScreen teardown()`)

    //const worldStore = useWorldStore()

    if (this.dialogText) {
      SAGEdit.app.stage.removeChild(this.dialogText)
      this.dialogText.destroy()
      //this.dialogText = null
    }
    if (this.backdrop) {
      SAGEdit.app.stage.removeChild(this.backdrop)
      this.backdrop.destroy()
    }
    // Unsubscribe from events, etc.
    for (const prop of this.props) {
      prop.tidyUp()
      prop.destroy()
    }
    // for (const door of this.doors) {
    //   door.tidyUp()
    // }
    SAGEdit.app.stage.off("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.off("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.off("touchmove", this.onTouchMove, this)

    // Fade out scene music
    // if (this.scene.sound) {
    //   SAGE.Sound.stop(this.scene.sound, !restartGame)
    // }

    // remove everything from stage
    this.removeChildren()
  }

  private buildBackdrop() {
    // Backdrop
    let sprite = undefined
    if (this.scene?.image) {
      //console.log(this.scene.image)

      //sprite = Sprite.from("/clampy.png")

      const base = new BaseTexture(this.scene.image)
      const texture = new Texture(base)
      sprite = Sprite.from(texture)

      //sprite = new Sprite(Texture.EMPTY)
      //sprite = Sprite.from(this.scene.image)
    } else {
      sprite = new Sprite(Texture.EMPTY)
    }
    sprite.anchor.set(0.5)
    sprite.x = SAGEdit.width / 2
    sprite.y = SAGEdit.height / 2
    this.addChild(sprite)
    //SAGEdit.app.stage.addChild(sprite)
    this.backdrop = sprite

    // Events
    // this.backdropInputEvents = new InputEventEmitter(this.backdrop)
    // this.backdrop.on("primaryaction", this.onPrimaryAction, this)
    // this.backdrop.on("secondaryaction", this.onSecondaryAction, this)
  }

  private buildProps() {
    // Only create Lamp if not already "picked up"
    // TODO: Make this all dynamic/data-based eventually, this is just a crude example!
    //if (this.props.length > 0) {
    //for (const propData of this.props) {
    const propStore = usePropStore()
    const scenePropModels = propStore.findPropBySceneId(this.scene?.id || "")

    if (scenePropModels.length > 0) {
      for (const propModel of scenePropModels) {
        this.addProp(propModel)
      }
    }

    //SAGE.Dialog.clearMessage()
  }

  public addProp(data: PropModel, fadeIn = false) {
    // Create new component obj (contains data + view)
    const prop = new Prop(data)
    this.addChild(prop.sprite)
    this.props.push(prop)
    // Don't add to scene.propdata here, as it likely already came from it?

    // Force to be draggable now
    data.draggable = true

    // Fade in?
    if (fadeIn) {
      prop.sprite.alpha = 0
      new Tween(prop.sprite).to({ alpha: 1 }, 500).start()
    }

    // DEBUG?
    if (SAGEdit.debugMode) {
      //debugger
      const graphics = new Graphics()
      const propWidth = prop.data.width || 0,
        propHeight = prop.data.height || 0
      graphics.beginFill(0xe74c3c, 125) // Red
      graphics.lineStyle(10, 0xff0000)
      graphics.pivot.set(propWidth / 2, propHeight / 2)
      // Need to handle diff for "non-image" sprites
      // (as Graphics scaling goes screwy if image dimensions are not really there)
      if (prop.data.image) {
        graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
        prop.sprite.addChild(graphics)
      } else {
        graphics.drawRoundedRect(
          prop.sprite.x,
          prop.sprite.y,
          prop.sprite.width,
          prop.sprite.height,
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
            (item) => item.data.id === prop.data.id
          )
          if (index !== -1) this.props.splice(index, 1)
          prop.tidyUp()
          // remove from game data
          //          this.scene.removePropDataById(prop.data.id)
        })
    }
    if (scaleAnim) {
      new Tween(prop.sprite.scale).to({ x: 1.5, y: 1.5 }, 500).start()
    }
  }

  private buildDoorways() {
    // if (this.scene.doors.length > 0) {
    //   for (const doorData of this.scene.doors) {
    //     // Create new component obj (contains data + view)
    //     const door = new Door(doorData)
    //     this.addChild(door.graphics)
    //     this.doors.push(door)
    //   }
    // }
    //SAGE.Dialog.clearMessage()
  }

  public update() {
    //{(_framesPassed: number): void {
    // Do any movement here...

    //You need to update a group for the tweens to do something!
    Group.shared.update()
  }

  private onPointerMove(_e: InteractionEvent) {
    //SAGE.debugLog(`${this.name}::onPointerMove()`)
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
    //_e: InteractionEvent) {
    SAGEdit.debugLog(`${this.name}::onPointerUp()`)
    if (this.draggedProp) {
      // We were dragging something - did we drop it on something?
      // if (this.dragTarget) {
      //   // Was it a valid object?
      //   //        this.draggedProp.use(this.dragTarget)
      // } else {
      //   // Didn't drop on object, so... do nothing? (+put back to orig pos)
      //   this.draggedProp.sprite.x = this.draggedProp.data.x || 0
      //   this.draggedProp.sprite.y = this.draggedProp.data.y || 0
      // }
      // End Drag+Drop mode
      this.draggedProp.dragging = false
      // Save final pos
      this.draggedProp.data.x = Math.floor(this.draggedProp.sprite.x)
      this.draggedProp.data.y = Math.floor(this.draggedProp.sprite.y)
      // Restore interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = true
      this.draggedProp.sprite.alpha = 1
      this.draggedProp = undefined
      // Update inventory (in case it was an inventory prop)
      //      SAGE.invScreen.update()
    } else {
      // Test deselect prop/door
      // Select clicked prop
      const worldStore = useWorldStore()
      worldStore.currPropId = ""
      worldStore.currDoorId = ""
    }
  }

  private onTouchMove(_e: InteractionEvent) {
    SAGEdit.debugLog(`${this.name}::onTouchMove()`)
    // Get touch position
    const touchPoint: Point = new Point()
    _e.data.getLocalPosition(this, touchPoint, _e.data.global)
    // Check for any collisions...
    //const result = this.checkTouchCollisions(touchPoint)
    //if (result) {
    // if (this.touchTarget) this.touchTarget.onPointerOver()
    // else SAGE.Dialog.clearMessage()
    //}
  }

  private checkDragCollisions() {
    // Check selected/dragged Prop with
    // let currTarget = undefined
    // //  > Other Props in inventory
    // for (const prop of SAGE.invScreen.propsList) {
    //   if (
    //     Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)
    //   ) {
    //     SAGE.debugLog(`>> collided with ${prop.data.name}`)
    //     currTarget = prop
    //   }
    // }
    // //  > Other Props in current scene
    // for (const prop of this.props) {
    //   if (
    //     Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)
    //   ) {
    //     SAGE.debugLog(`>> collided with ${prop.data.name}`)
    //     currTarget = prop
    //   }
    // }
    // //  > Doors in current scene
    // for (const door of this.doors) {
    //   if (
    //     Collision.isCollidingObjToObj(this.draggedProp?.sprite, door.graphics)
    //   ) {
    //     SAGE.debugLog(`>> collided with ${door.data.name}`)
    //     currTarget = door
    //   }
    // }
    // // If collision, then highlight source AND target
    // // (...and remember if "dropped" on it)
    // if (currTarget !== this.dragTarget) {
    //   if (currTarget) {
    //     // Different target...
    //     SAGE.debugLog(`>> new target = ${currTarget.data.name}`)
    //   } else {
    //     // Lost target
    //     SAGE.debugLog(`>> NO target`)
    //   }
    //   this.dragTarget = currTarget
    // }
  }

  //private checkTouchCollisions(touchPoint: Point): boolean {
  // Check selected/dragged Prop with
  // let currTarget = undefined
  // //  > Other Props in inventory
  // for (const prop of SAGE.invScreen.propsList) {
  //   if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
  //     SAGE.debugLog(`>> collided with ${prop.data.name}`)
  //     currTarget = prop
  //   }
  // }
  // //  > Other Props in current scene
  // for (const prop of this.props) {
  //   if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
  //     SAGE.debugLog(`>> collided with ${prop.data.name}`)
  //     currTarget = prop
  //   }
  // }
  // //  > Doors in current scene
  // for (const door of this.doors) {
  //   if (Collision.isCollidingPointToObj(touchPoint, door.graphics)) {
  //     SAGE.debugLog(`>> collided with ${door.data.name}`)
  //     currTarget = door
  //   }
  // }

  // // If collision, then highlight source AND target
  // // (...and remember if "dropped" on it)
  // if (currTarget !== this.touchTarget) {
  //   if (currTarget) {
  //     // Different target...
  //     SAGE.debugLog(`>> new target = ${currTarget.data.name}`)
  //   } else {
  //     // Lost target
  //     SAGE.debugLog(`>> NO target`)
  //   }
  //   this.touchTarget = currTarget
  //   return true
  // }
  //return false
  //}
}
