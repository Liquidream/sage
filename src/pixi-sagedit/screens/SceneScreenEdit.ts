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
  VideoResource,
} from "pixi.js"

import { SAGEdit } from "../SAGEdit"
import { PropEdit } from "../PropEdit"
import { DoorEdit } from "../DoorEdit"
import type { SceneModel } from "@/models/SceneModel"
import type { PropModel } from "@/models/PropModel"
import { useWorldStore, type WorldState } from "@/stores/WorldStore"
import { useSceneStore } from "@/stores/SceneStore"
import { usePropStore } from "@/stores/PropStore"
import { useDoorStore } from "@/stores/DoorStore"
import { InputEventEmitter } from "../../pixi-sageplay/screens/ui/InputEventEmitter"
import { text } from "stream/consumers"

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

  private lastWorldState: WorldState | undefined

  constructor() {
    super()

    // Subscribe to World state changes so that we refresh/recreate Pixi.js content
    const worldStore = useWorldStore()
    this.scene = worldStore.getCurrentScene
    worldStore.$subscribe((mutation, state) => {
      // Current selection/scene changed
      //if (mutation.events) // Can't do - is DEV only!
      SAGEdit.debugLog("World changed - so refresh scene model (pixi)")
      //this.scene = worldStore.getCurrentScene
      this.refresh()
    })

    // Subscribe to Scene state changes so that we refresh/recreate Pixi.js content
    const sceneStore = useSceneStore()
    sceneStore.$subscribe(() => {
      // Scene changed
      //debugger
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

    // Listen for Prop updates
    SAGEdit.Events.on(
      "propUpdated",
      (updatedProp: PropModel) => {
        // Delete + recreate updated Prop
        // Find matching prop
        const propToDel = this.props.find((obj) => {
          return obj.data.id === updatedProp.id
        })
        if (propToDel) {
          console.log("delete and recreate 'pixi' prop")
          // Delete prop
          this.removeProp(propToDel)
          // Now re-add prop
          this.addProp(updatedProp)
        }
      },
      this
    )

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
    // Determine what's changed to know how much to refresh
    const newWorldState = useWorldStore().$state
    // Has selected scene changed?
    if (
      this.scene === undefined ||
      newWorldState.currSceneId != this.lastWorldState?.currSceneId
    ) {
      // Scene changed - complete re-do
      this.scene = useWorldStore().getCurrentScene
      this.teardown()
      this.setup()
    } else if (
      newWorldState.currPropId != this.lastWorldState?.currPropId ||
      newWorldState.currDoorId != this.lastWorldState?.currDoorId
    ) {
      // Current selection (Prop/Door) changed
      if (newWorldState.currPropId !== "") {
        SAGEdit.Events.emit("selectionChanged", newWorldState.currPropId)
      } else {
        SAGEdit.Events.emit("selectionChanged", newWorldState.currDoorId)
      }
    }
    // Add/Remove props
    const newPropModels = usePropStore().findPropBySceneId(this.scene?.id || "")
    //finish me ...
    // for (const prop of this.props) {
    //   prop.tidyUp()
    //   prop.destroy()
    // }
    // for (const door of this.doors) {
    //   door.tidyUp()
    // }
    // Update dialog
    if (this.dialogText) this.removeChild(this.dialogText)
    this.buildDialogText()

    // Remember...
    this.lastWorldState = Object.assign({}, newWorldState)
    //this.lastWorldState = newWorldState // Can't do this, as it stores proxy to live data!
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
    this.buildDialogText()

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

  private buildDialogText() {
    const worldStore = useWorldStore()
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
  }

  private buildBackdrop() {
    // Backdrop
    let sprite = undefined
    if (this.scene?.image) {
      // Is it a video?
      if (this.scene?.image.includes("data:video")) {
        // Load video data
        const element = document.createElement("video")
        element.src = this.scene.image // e.g. "data:video/mp4;base64,xxxxxx"
        element.preload = "auto"
        element.loop = true

        const resource = new VideoResource(element)
        const texture = Texture.from(resource)
        // https://github.com/pixijs/pixi.js/issues/6501 - SOLVED!!
        //resource.source.loop = true
        sprite = Sprite.from(texture)
        sprite.width = SAGEdit.width
        sprite.height = SAGEdit.height
      } else {
        // Load image data
        const base = new BaseTexture(this.scene.image)
        const texture = new Texture(base)
        sprite = Sprite.from(texture)

        if (base.valid) {
          // (Only called if prev loaded image is re-loaded)
          const viewRatio = SAGEdit.width / SAGEdit.height //1.77
          const imageRatio = sprite.width / sprite.height
          if (imageRatio < viewRatio) {
            sprite.width = SAGEdit.width
            sprite.height = sprite.width / imageRatio
          } else {
            sprite.height = SAGEdit.height
            sprite.width = sprite.height * imageRatio
          }
        } else {
          // ...else grab dimensions one texture fully loaded
          base.on("loaded", () => {
            // debugger
            const viewRatio = SAGEdit.width / SAGEdit.height //1.77
            const imageRatio = sprite.width / sprite.height
            if (imageRatio < viewRatio) {
              sprite.width = SAGEdit.width
              sprite.height = sprite.width / imageRatio
            } else {
              sprite.height = SAGEdit.height
              sprite.width = sprite.height * imageRatio
            }
          })
        }
      }
      //-----
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

  public addProp(propModel: PropModel) {
    const graphics = new Graphics()
    // Create new component obj (contains data + view)
    const prop = new PropEdit(propModel, graphics)
    this.addChild(prop.sprite)
    this.props.push(prop)
    // Don't add to scene.propdata here, as it likely already came from it?

    // Force to be draggable now
    //propModel.draggable = true // Could use this to lock prop postions?

    this.addChild(graphics)
  }

  /**
   * Removes a Prop from a scene
   */
  removeProp(prop: PropEdit) {
    this.removeChild(prop.sprite)
    this.removeChild(prop.graphics)
    const index = this.props.findIndex((item) => item.data.id === prop.data.id)
    if (index !== -1) this.props.splice(index, 1)
    prop.tidyUp()
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
