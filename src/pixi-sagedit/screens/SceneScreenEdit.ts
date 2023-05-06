import { Group, Tween } from "tweedle.js" //Easing
import {
  Container,
  Graphics,
  FederatedPointerEvent,
  Point,
  Sprite,
  TextStyle,
  Texture,
  Text,
  BaseTexture,
} from "pixi.js"

import { SAGEdit } from "../SAGEdit"
import { PropEdit } from "../PropEdit"
import { DoorEdit } from "../DoorEdit"
import type { SceneModel } from "@/models/SceneModel"
import type { PropModel } from "@/models/PropModel"
import { useWorldStore } from "@/stores/WorldStore"
import { useSceneStore } from "@/stores/SceneStore"
import { usePropStore } from "@/stores/PropStore"
import { useDoorStore } from "@/stores/DoorStore"
import { InputEventEmitter } from "../../pixi-sageplay/screens/ui/InputEventEmitter"

export class SceneScreen extends Container {
  private dialogText!: Text | null

  private scene: SceneModel | undefined
  private backdrop!: Sprite
  private props: Array<PropEdit> = []
  private doors: Array<DoorEdit> = []

  public draggedProp!: PropEdit | undefined
  public draggedDoor!: DoorEdit | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dragTarget!: any // Could be Prop or Door
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public touchTarget!: any // Could be Prop or Door

  private backdropInputEvents!: InputEventEmitter

  constructor() {
    super()

    // Subscribe to World state changes so that we refresh/recreate Pixi.js content
    const worldStore = useWorldStore()
    this.scene = worldStore.getCurrentScene
    worldStore.$subscribe(() => {
      // Current scene changed
      SAGEdit.debugLog("World changed - so refresh scene model (pixi)")
      this.scene = worldStore.getCurrentScene
      this.refresh()
    })

    // Subscribe to Scene state changes so that we refresh/recreate Pixi.js content
    const sceneStore = useSceneStore()
    sceneStore.$subscribe(() => {
      // Scene changed
      //if (this.scene?.id !== worldStore.currSceneId) {
      SAGEdit.debugLog("Scene changed - so refresh scene model (pixi)")
      this.refresh()
    })

    // Subscribe to Prop state changes so that we refresh/recreate Pixi.js content
    const propStore = usePropStore()
    propStore.$subscribe(() => {
      SAGEdit.debugLog("Prop changed - so refresh scene model (pixi)")
      this.refresh()
    })

    // Subscribe to Door state changes so that we refresh/recreate Pixi.js content
    const doorStore = useDoorStore()
    doorStore.$subscribe(() => {
      SAGEdit.debugLog("Door changed - so refresh scene model (pixi)")
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

    // Moved re-getting store here to try to resolve rendering issue
    // (when jump straight to scene/selection on reload)
    const worldStore = useWorldStore()
    this.scene = worldStore.getCurrentScene

    // Construct scene from data
    this.buildBackdrop()
    this.buildDoorways()
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
    // Get selected "name"
    let dialogText = this.scene?.name
    if (worldStore.currPropId != "") {
      dialogText = worldStore.getCurrentProp?.name
    }
    if (worldStore.currDoorId != "") {
      dialogText = worldStore.getCurrentDoor?.name
    }

    this.dialogText = new Text(dialogText, styly) // Text supports unicode!
    this.dialogText.x = SAGEdit.width / 2
    this.dialogText.y = SAGEdit.height - this.dialogText.height / 2 - 80
    this.dialogText.anchor.set(0.5)
    // .text = "This is expensive to change, please do not abuse";
    this.addChild(this.dialogText)

    // Drag+Drop support
    SAGEdit.app.stage.interactive = true
    SAGEdit.app.stage.on("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.on("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.on("touchmove", this.onTouchMove, this)
  }

  teardown() {
    SAGEdit.debugLog(`>> SceneScreen teardown()`)

    if (this.dialogText) {
      SAGEdit.app.stage.removeChild(this.dialogText)
      this.dialogText.destroy()
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
    for (const door of this.doors) {
      door.tidyUp()
    }

    SAGEdit.app.stage.off("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.off("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.off("touchmove", this.onTouchMove, this)

    // remove everything from stage
    this.removeChildren()
  }

  private buildBackdrop() {
    // Backdrop
    let sprite = undefined
    if (this.scene?.image) {
      const base = new BaseTexture(this.scene.image)
      const texture = new Texture(base)
      sprite = Sprite.from(texture)
    } else {
      // console.log("<No scene backgdrop image specified>")
      sprite = new Sprite(Texture.EMPTY)
    }
    sprite.anchor.set(0.5)
    sprite.x = SAGEdit.width / 2
    sprite.y = SAGEdit.height / 2
    this.addChild(sprite)
    this.backdrop = sprite

    // Events
    this.backdropInputEvents = new InputEventEmitter(this.backdrop)
    this.backdrop.on("primaryaction", this.onPrimaryAction, this)
    // this.backdrop.on("secondaryaction", this.onSecondaryAction, this)
  }

  private buildProps() {
    const propStore = usePropStore()
    const scenePropModels = propStore.findPropBySceneId(this.scene?.id || "")

    if (scenePropModels.length > 0) {
      for (const propModel of scenePropModels) {
        this.addProp(propModel)
      }
    }
  }

  private buildDoorways() {
    const doorStore = useDoorStore()
    const sceneDoorModels = doorStore.findDoorBySceneId(this.scene?.id || "")

    if (sceneDoorModels.length > 0) {
      for (const doorModel of sceneDoorModels) {
        // Create new component obj (contains data + view)
        const door = new DoorEdit(doorModel)
        this.addChild(door.sprite)
        this.addChild(door.graphics)
        this.doors.push(door)
      }
    }
  }

  public addProp(propModel: PropModel, fadeIn = false) {
    // Create new component obj (contains data + view)
    const prop = new PropEdit(propModel)
    this.addChild(prop.sprite)
    this.props.push(prop)
    // Don't add to scene.propdata here, as it likely already came from it?

    // Force to be draggable now
    //propModel.draggable = true // Could use this to lock prop postions?

    // Fade in?
    if (fadeIn) {
      prop.sprite.alpha = 0
      new Tween(prop.sprite).to({ alpha: 1 }, 500).start()
    }

    // Selected Prop?
    const worldStore = useWorldStore()
    if (worldStore.currPropId === propModel.id) {
      const graphics = new Graphics()
      const propWidth = prop.data.width || 0,
        propHeight = prop.data.height || 0
      graphics.lineStyle(10, 0xff0000)
      // Set Graphics "canvas" to correct pos/width
      // (So we can easily move it when "dragging")
      graphics.x = propModel.x || 0
      graphics.y = propModel.y || 0
      graphics.width = propWidth
      graphics.height = propHeight
      graphics.pivot.set(propWidth / 2, propHeight / 2)
      // Need to handle diff for "non-image" sprites
      // (as Graphics scaling goes screwy if image dimensions are not really there)
      // if (prop.data.image) {
      //   graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
      //   prop.sprite.pa.addChild(graphics)
      //   //prop.sprite.addChild(graphics)
      // } else {
      graphics.drawRoundedRect(0, 0, propWidth, propHeight, 30)
      prop.graphics = graphics
      this.addChild(graphics)
      //}
      graphics.endFill()
    }
  }

  /**
   * Removes a Prop from a scene (default = fade out).
   */
  removeProp(prop: PropEdit, fadeOut = true, scaleAnim?: boolean) {
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
        })
    }
    if (scaleAnim) {
      new Tween(prop.sprite.scale).to({ x: 1.5, y: 1.5 }, 500).start()
    }
  }

  public update() {
    //{(_framesPassed: number): void {
    // Do any movement here...

    //You need to update a group for the tweens to do something!
    Group.shared.update()
  }

  private onPointerMove(_e: FederatedPointerEvent) {
    //SAGE.debugLog(`${this.name}::onPointerMove()`)
    if (this.draggedProp) {
      // Temp remove interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = false
      // Update pos
      this.draggedProp.graphics.x = _e.data.global.x
      this.draggedProp.graphics.y = _e.data.global.y
      this.draggedProp.sprite.x = _e.data.global.x
      this.draggedProp.sprite.y = _e.data.global.y
      // Check for valid "drop"
      //this.checkDragCollisions()
    }
    if (this.draggedDoor) {
      // Temp remove interaction to "dragged" Prop
      this.draggedDoor.graphics.interactive = false
      // Update pos
      this.draggedDoor.graphics.x = _e.data.global.x
      this.draggedDoor.graphics.y = _e.data.global.y
      this.draggedDoor.sprite.x = this.draggedDoor.graphics.x
      this.draggedDoor.sprite.y = this.draggedDoor.graphics.y
      // Check for valid "drop"
      //this.checkDragCollisions()
    }
  }

  private onPrimaryAction() {
    // Deselect all (only scene)
    const worldStore = useWorldStore()
    worldStore.currPropId = ""
    worldStore.currDoorId = ""
  }

  private onPointerUp() {
    //_e: InteractionEvent) {
    SAGEdit.debugLog(`${this.name}::onPointerUp()`)

    if (this.draggedProp) {
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
    }
    if (this.draggedDoor) {
      // End Drag+Drop mode
      this.draggedDoor.dragging = false
      // Save final pos
      this.draggedDoor.data.x = Math.floor(this.draggedDoor.graphics.x)
      this.draggedDoor.data.y = Math.floor(this.draggedDoor.graphics.y)
      this.draggedDoor.sprite.x = this.draggedDoor.data.x
      this.draggedDoor.sprite.y = this.draggedDoor.data.y

      // Restore interaction to "dragged" Prop
      this.draggedDoor.graphics.interactive = true
      this.draggedDoor.graphics.alpha = 1
      this.draggedDoor = undefined
      // Update inventory (in case it was an inventory prop)
      //      SAGE.invScreen.update()
    }
  }

  private onTouchMove(_e: FederatedPointerEvent) {
    SAGEdit.debugLog(`${this.name}::onTouchMove()`)
    // Get touch position
    const touchPoint: Point = new Point()
    _e.data.getLocalPosition(this, touchPoint, _e.data.global)
  }
}
