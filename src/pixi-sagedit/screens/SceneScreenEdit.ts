//import { Group, Tween } from "tweedle.js" //Easing
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
  BlurFilter,
} from "pixi.js"

import { SAGEdit } from "../SAGEdit"
import { PropEdit } from "../PropEdit"
import { DoorEdit } from "../DoorEdit"
import { ActorEdit } from "../ActorEdit"
import type { SceneModel } from "@/models/SceneModel"
import type { PropModel } from "@/models/PropModel"
import type { DoorModel } from "@/models/DoorModel"
import type { ActorModel } from "@/models/ActorModel"
import { useWorldStore, type WorldState } from "@/stores/WorldStore"
import { useSceneStore } from "@/stores/SceneStore"
import { usePropStore } from "@/stores/PropStore"
import { useDoorStore } from "@/stores/DoorStore"
import { useActorStore } from "@/stores/ActorStore"
import { InputEventEmitter } from "../../pixi-sageplay/screens/ui/InputEventEmitter"

export class SceneScreen extends Container {
  private dialogText!: Text | null

  private scene: SceneModel | undefined
  private backdrop!: Sprite
  private props: Array<PropEdit> = []
  private doors: Array<DoorEdit> = []
  private actors: Array<ActorEdit> = []

  public draggedProp!: PropEdit | undefined
  public draggedDoor!: DoorEdit | undefined
  public draggedActor!: ActorEdit | undefined
  public draggedResizeObj: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dragTarget!: any // Could be Prop or Door
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public touchTarget!: any // Could be Prop or Door

  private backdropInputEvents!: InputEventEmitter
  private videoElement: HTMLMediaElement | undefined

  private lastWorldState: WorldState | undefined
  private lastSceneModel: SceneModel | undefined

  private worldStore = useWorldStore()
  private propStore = usePropStore()
  private sceneStore = useSceneStore()
  private doorStore = useDoorStore()
  private actorStore = useActorStore()

  constructor() {
    super()

    // Only proceed once ALL stores have fully loaded
    // (takes longer with IndexedDB)
    Promise.all([
      this.worldStore.$persistedState.isReady(),
      this.sceneStore.$persistedState.isReady(),
      this.propStore.$persistedState.isReady(),
      this.doorStore.$persistedState.isReady(),
      this.actorStore.$persistedState.isReady(),
    ]).then(() => {
      console.log("All stores hydrated, now initialise SceneScreen")
      // Subscribe to World state/Editor changes so that we refresh/recreate Pixi.js content
      this.subscribeToEvents()
      // perform initial setup
      this.setup()
    })
  }

  subscribeToEvents() {
    // ------------------------------
    // World related
    {
      // Subscribe to World state changes so that we refresh/recreate Pixi.js content
      //const worldStore = useWorldStore()
      this.scene = this.worldStore.getCurrentScene
      this.worldStore.$subscribe((mutation, state) => {
        // Current selection/scene changed
        //if (mutation.events) // Can't do - is DEV only!
        SAGEdit.debugLog("World changed - so refresh scene model (pixi)")
        this.scene = this.worldStore.getCurrentScene
        this.refresh()
      })
    }

    // ------------------------------
    // Scene related
    {
      // Subscribe to Scene state changes so that we refresh/recreate Pixi.js content
      //const sceneStore = useSceneStore()
      this.sceneStore.$subscribe(() => {
        // Scene changed
        //debugger
        //if (this.scene?.id !== worldStore.currSceneId) {
        SAGEdit.debugLog("Scene changed - so refresh scene model (pixi)")
        this.refresh()
      })
    }

    // ------------------------------
    // Prop related
    {
      // Listen for Prop created
      SAGEdit.Events.on(
        "propAdded",
        (newProp: PropModel) => {
          this.addProp(newProp)
        },
        this
      )

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
            // Now re-add prop (if still in scene)
            if (updatedProp.location_id === this.scene?.id) {
              this.addProp(updatedProp)
            }
            // refresh dialog (and anything else?)
            this.refresh()
          }
        },
        this
      )

      // Listen for Prop removed
      SAGEdit.Events.on(
        "propRemoved",
        (oldProp: PropModel) => {
          // Find matching prop
          const propToDel = this.props.find((obj) => {
            return obj.data.id === oldProp.id
          })
          if (propToDel) {
            this.removeProp(propToDel)
          }
        },
        this
      )
    }

    // ------------------------------
    // Door related
    {
      // Listen for Door created
      SAGEdit.Events.on(
        "doorAdded",
        (newDoor: DoorModel) => {
          this.addDoor(newDoor)
        },
        this
      )

      // Listen for Door updates
      SAGEdit.Events.on(
        "doorUpdated",
        (updatedDoor: DoorModel) => {
          // Delete + recreate updated Door
          // Find matching door
          const doorToDel = this.doors.find((obj) => {
            return obj.data.id === updatedDoor.id
          })
          if (doorToDel) {
            console.log("delete and recreate 'pixi' door")
            // Delete door
            this.removeDoor(doorToDel)
            // Now re-add door (if still in scene)
            if (updatedDoor.location_id === this.scene?.id) {
              // Now re-add door
              this.addDoor(updatedDoor)
            }
            // refresh dialog (and anything else?)
            this.refresh()
          }
        },
        this
      )

      // Listen for Door removed
      SAGEdit.Events.on(
        "doorRemoved",
        (oldDoor: DoorModel) => {
          // Find matching door
          const doorToDel = this.doors.find((obj) => {
            return obj.data.id === oldDoor.id
          })
          if (doorToDel) {
            this.removeDoor(doorToDel)
          }
        },
        this
      )
    }

    // ------------------------------
    // Actor related
    {
      // Listen for Actor created
      SAGEdit.Events.on(
        "actorAdded",
        (newActor: ActorModel) => {
          this.addActor(newActor)
        },
        this
      )

      // Listen for Actor updates
      SAGEdit.Events.on(
        "actorUpdated",
        (updatedActor: ActorModel) => {
          // Delete + recreate updated Actor
          // Find matching actor
          const actorToDel = this.actors.find((obj) => {
            return obj.data.id === updatedActor.id
          })
          if (actorToDel) {
            console.log("delete and recreate 'pixi' actor")
            // Delete actor
            this.removeActor(actorToDel)
            // Now re-add actor (if still in scene)
            if (updatedActor.location_id === this.scene?.id) {
              // Now re-add actor
              this.addActor(updatedActor)
            }
            // refresh dialog (and anything else?)
            if (this.dialogText) this.removeChild(this.dialogText)
            this.buildDialogText()
          }
        },
        this
      )

      // Listen for Actor removed
      SAGEdit.Events.on(
        "actorRemoved",
        (oldActor: ActorModel) => {
          // TODO: Remove Actor from scene - don't delete from store,
          //       as likely to have lots of scripts associated!
          // Find matching actor
          const actorToDel = this.actors.find((obj) => {
            return obj.data.id === oldActor.id
          })
          if (actorToDel) {
            this.removeActor(actorToDel)
          }
          // refresh dialog (and anything else?)
          this.refresh()
        },
        this
      )
    }
  }

  refresh() {
    // Determine what's changed to know how much to refresh
    const newWorldState = this.worldStore.$state
    //const newScene = useWorldStore().getCurrentScene
    // Has selected scene changed?
    if (
      this.scene === undefined ||
      newWorldState.currSceneId !== this.lastWorldState?.currSceneId ||
      this.scene.image !== this.lastSceneModel?.image
    ) {
      // Scene changed - complete re-do
      this.scene = this.worldStore.getCurrentScene
      this.teardown()
      this.setup()
    } else if (
      newWorldState.currPropId != this.lastWorldState?.currPropId ||
      newWorldState.currDoorId != this.lastWorldState?.currDoorId ||
      newWorldState.currActorId != this.lastWorldState?.currActorId
    ) {
      // Current selection (Prop/Door) changed
      if (newWorldState.currPropId !== "") {
        SAGEdit.Events.emit("selectionChanged", newWorldState.currPropId)
      } else if (newWorldState.currDoorId !== "") {
        SAGEdit.Events.emit("selectionChanged", newWorldState.currDoorId)
      } else if (newWorldState.currActorId !== "") {
        SAGEdit.Events.emit("selectionChanged", newWorldState.currActorId)
      } else {
        SAGEdit.Events.emit("selectionChanged", "")
      }
    }
    // Add/Remove props
    //const newPropModels = usePropStore().findPropBySceneId(this.scene?.id || "")
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
    this.lastSceneModel = Object.assign({}, this.scene)
    //this.lastWorldState = newWorldState // Can't do this, as it stores proxy to live data!
  }

  setup() {
    SAGEdit.debugLog("SceneScreenEdit : setup()...")

    // Moved re-getting store here to try to resolve rendering issue
    // (when jump straight to scene/selection on reload)
    //const worldStore = useWorldStore()
    this.scene = this.worldStore.getCurrentScene
    // Store initial states for ref
    this.lastWorldState = Object.assign({}, this.worldStore.$state)
    this.lastSceneModel = Object.assign({}, this.scene)

    if (this.worldStore.currSceneId !== "") {
      // Construct scene from data
      this.buildBackdrop()
      this.buildProps()
      this.buildDoorways()
      this.buildActors()
      this.buildDialogText()
    } else if (this.worldStore.currActorId !== "") {
      this.buildActors()
      this.buildDialogText()
    }

    // Drag+Drop support
    SAGEdit.app.stage.interactive = true
    SAGEdit.app.stage.on("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.on("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.on("touchmove", this.onTouchMove, this)


    // Test blur
    // const blurFilter = new BlurFilter()
    // SAGEdit.backLayer.filters = [blurFilter]
  }

  teardown() {
    SAGEdit.debugLog(`>> SceneScreen teardown()`)

    if (this.dialogText) {
      SAGEdit.app.stage.removeChild(this.dialogText)
      // Seems to throw errors when going scene > actor mode
      if (this.dialogText.texture) this.dialogText.destroy()
    }
    if (this.backdrop) {
      SAGEdit.app.stage.removeChild(this.backdrop)
      // Seems to throw errors when going scene > actor mode
      if (this.backdrop.texture) this.backdrop.destroy()
      // Now remove video element
      //const videoElement = document.getElementById("tempVideo")
      if (this.videoElement) {
        // https://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
        this.videoElement.pause()
        this.videoElement.removeAttribute("src") // empty source
        this.videoElement.load()
        this.videoElement.remove() // for good measure!
      }
      //document.getElementById("tempVideo")?.remove()
    }
    // Unload, Unsubscribe from events, etc.
    for (const prop of this.props) {
      prop.tidyUp()
      prop.destroy()
    }
    this.props = []

    for (const door of this.doors) {
      door.tidyUp()
    }
    this.doors = []

    for (const actor of this.actors) {
      actor.tidyUp()
    }
    this.actors = []

    SAGEdit.app.stage.off("pointermove", this.onPointerMove, this)
    SAGEdit.app.stage.off("pointerup", this.onPointerUp, this)
    SAGEdit.app.stage.off("touchmove", this.onTouchMove, this)

    // remove everything from stage
    this.removeChildren()
  }

  private buildDialogText() {
    //const worldStore = useWorldStore()
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
    if (this.worldStore.currPropId != "") {
      dialogText = this.worldStore.getCurrentProp?.name
    }
    if (this.worldStore.currDoorId != "") {
      dialogText = this.worldStore.getCurrentDoor?.name
    }
    if (this.worldStore.currActorId != "") {
      dialogText = this.worldStore.getCurrentActor?.name
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
        this.videoElement = document.createElement("video")
        this.videoElement.id = "tempVideo"
        this.videoElement.src = this.scene.image // e.g. "data:video/mp4;base64,xxxxxx"
        this.videoElement.preload = "auto"
        this.videoElement.loop = true

        const resource = new VideoResource(this.videoElement)
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
    //const propStore = usePropStore()
    const scenePropModels = this.propStore.findPropBySceneId(this.scene?.id || "")

    if (scenePropModels.length > 0) {
      for (const propModel of scenePropModels) {
        this.addProp(propModel)
      }
    }
  }

  private buildDoorways() {
    //const doorStore = useDoorStore()
    const sceneDoorModels = this.doorStore.findDoorBySceneId(this.scene?.id || "")

    if (sceneDoorModels.length > 0) {
      for (const doorModel of sceneDoorModels) {
        this.addDoor(doorModel)
      }
    }
  }

  private buildActors() {
    //const actorStore = useActorStore()
    // Scene mode?
    if (this.worldStore.currSceneId !== "") {
      const sceneActorModels = this.actorStore.findActorBySceneId(
        this.scene?.id || ""
      )
      if (sceneActorModels.length > 0) {
        for (const actorModel of sceneActorModels) {
          this.addActor(actorModel)
        }
      }
    } else {
      // Actor-only Edit mode
      const actorModel = this.worldStore.getCurrentActor
      this.addActor(actorModel)
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
    
    // UI
    this.addChild(graphics)
    this.addChild(prop.resizeSprite)
  }

  /**
   * Removes a Prop from a scene
   */
  removeProp(prop: PropEdit) {
    if (prop.sprite) this.removeChild(prop.sprite)
    if (prop.resizeSprite) this.removeChild(prop.resizeSprite)
    this.removeChild(prop.graphics)
    const index = this.props.findIndex((item) => item.data.id === prop.data.id)
    if (index !== -1) this.props.splice(index, 1)
    prop.tidyUp()
  }

  public addDoor(doorModel: DoorModel) {
    // Create new component obj (contains data + view)
    const door = new DoorEdit(doorModel)
    this.addChild(door.sprite)
    this.addChild(door.graphics)
    this.doors.push(door)
  }

  removeDoor(door: DoorEdit) {
    this.removeChild(door.sprite)
    this.removeChild(door.graphics)
    const index = this.doors.findIndex((item) => item.data.id === door.data.id)
    if (index !== -1) this.doors.splice(index, 1)
    door.tidyUp()
  }

  public addActor(actorModel: ActorModel) {
    const graphics = new Graphics()
    // Create new component obj (contains data + view)
    const actor = new ActorEdit(actorModel, graphics)
    this.addChild(actor.sprite)
    this.actors.push(actor)
    this.addChild(graphics)
  }

  /**
   * Removes an Actor from a scene
   */
  removeActor(actor: ActorEdit) {
    if (actor.sprite) this.removeChild(actor.sprite)
    this.removeChild(actor.graphics)
    const index = this.actors.findIndex(
      (item) => item.data.id === actor.data.id
    )
    if (index !== -1) this.actors.splice(index, 1)
    actor.tidyUp()
  }

  public update() {
    //{(_framesPassed: number): void {
    // Do any movement here...
    //You need to update a group for the tweens to do something!
    //Group.shared.update()
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
      // UI
      this.draggedProp.resizeSprite.x = _e.data.global.x + this.draggedProp.data.width / 2
      this.draggedProp.resizeSprite.y = _e.data.global.y + this.draggedProp.data.height / 2
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
    if (this.draggedActor) {
      // Temp remove interaction to "dragged" Prop
      this.draggedActor.graphics.interactive = false
      // Update pos
      this.draggedActor.graphics.x = _e.data.global.x
      this.draggedActor.graphics.y = _e.data.global.y
      this.draggedActor.sprite.x = this.draggedActor.graphics.x
      this.draggedActor.sprite.y = this.draggedActor.graphics.y
      // Check for valid "drop"
      //this.checkDragCollisions()
    }
    if (this.draggedResizeObj) {
      // Temp remove interaction to "dragged" Prop
      this.draggedResizeObj.interactive = false
      // Update pos
      this.draggedResizeObj.x = _e.data.global.x
      this.draggedResizeObj.y = _e.data.global.y
      // Update scale
      //this.cur
      // Check for valid "drop"
      //this.checkDragCollisions()
    }
  }

  private onPrimaryAction() {
    // Deselect all (only scene)
    console.log("onPrimaryAction() > deselect all")
    this.worldStore.currPropId = ""
    this.worldStore.currDoorId = ""
    this.worldStore.currActorId = ""
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
      // UI
      this.draggedProp.resizeSprite.interactive = true
      this.draggedProp = undefined
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
    if (this.draggedActor) {
      // End Drag+Drop mode
      this.draggedActor.dragging = false
      // Save final pos
      this.draggedActor.data.x = Math.floor(this.draggedActor.graphics.x)
      this.draggedActor.data.y = Math.floor(this.draggedActor.graphics.y)
      this.draggedActor.sprite.x = this.draggedActor.data.x
      this.draggedActor.sprite.y = this.draggedActor.data.y

      // Restore interaction to "dragged" Prop
      this.draggedActor.graphics.interactive = true
      this.draggedActor.graphics.alpha = 1
      this.draggedActor = undefined
      // Update inventory (in case it was an inventory prop)
      //      SAGE.invScreen.update()
    }
    // Resizing?
    if (this.draggedResizeObj) {
      // End Drag+Drop mode
      this.draggedResizeObj.resizing = false
      // Save final pos
      // this.draggedActor.data.x = Math.floor(this.draggedActor.graphics.x)
      // this.draggedActor.data.y = Math.floor(this.draggedActor.graphics.y)
      // this.draggedActor.sprite.x = this.draggedActor.data.x
      // this.draggedActor.sprite.y = this.draggedActor.data.y

      // Restore interaction to "dragged" sprite
      this.draggedResizeObj.interactive = true
      // this.draggedActor.graphics.alpha = 1
      this.draggedResizeObj = undefined
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
