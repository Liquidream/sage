import { Sprite, Texture } from "pixi.js";
import { Easing, Tween } from "tweedle.js";
import { SAGE } from "../Manager";
import { DialogType } from "./Dialog";
import { InputEventEmitter } from "./ui/InputEventEmitter";
import { IPropData } from "./PropData";

export class Prop {
  // "constants" 
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500;
  DRAG_SENSDIST = 25;
  DRAG_ALPHA = 0.75;

  public data!: IPropData;
  public sprite!: Sprite;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private propInputEvents!: InputEventEmitter;
  public dragging = false;

  public constructor(propData: IPropData) {
    // Initialise from data object
    let sprite = undefined;
    if (propData.image) {
      sprite = Sprite.from(propData.image);
    }
    else {
      sprite = new Sprite(Texture.EMPTY);
      sprite.width = propData.width;
      sprite.height = propData.height;
    }
    this.data = propData;
    this.sprite = sprite;
    sprite.anchor.set(0.5);
    sprite.x = propData.x;
    sprite.y = propData.y;

    // Events
    this.propInputEvents = new InputEventEmitter(this.sprite);
    this.sprite.on("primaryaction", this.onPrimaryAction, this);
    this.sprite.on("secondaryaction", this.onSecondaryAction, this);
    // Hover (info)
    this.sprite.on("pointerover", this.onPointerOver, this);
    this.sprite.on("pointerout", this.onPointerOut, this);
    // Drag+Drop
    this.sprite.on("pointerdown", this.onPointerDown, this);
    //
    SAGE.Events.on("scenehint", this.onSceneHint, this);

    // visible state
    this.sprite.visible = propData.visible;
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.sprite.removeAllListeners();
    SAGE.Events.off("scenehint", this.onSceneHint, this);
  }

  public async use(object: any) {
    let validUse = false;
    // Run any OnEnter action?    
    if (this.data.on_use) {
      validUse = await SAGE.Script.safeExecFuncWithParams(this.data.on_use, this, object);
    }
    SAGE.debugLog(`Use case valid? ${validUse}`);
    if (validUse) {
      // Valid use-case
    } else {
      // Invalid, so restore position
      // (if not already in inventory)
      if (!this.inInventory) {
        this.sprite.x = this.data.x
        this.sprite.y = this.data.y
      }
    }
  }

  public destroy() {
    if (this.inInventory) {
      SAGE.World.player.removeFromInventory(this.data.id)
    } 
    else {
      SAGE.World.currentScene.screen.removeProp(this, true)
    }
  }

  /** Returns whether or not the this prop is in player's inventory */
  public get inInventory(): boolean {
    return SAGE.World.player.inventory.some(prop => prop.id === this.data.id)
  }

  private onSceneHint() {
    // Show attract tween for this
    // (...but abort if in player inventory!)
    if (this.inInventory)
      return;
    const attractShine: Sprite = Sprite.from("UI-Shine");
    attractShine.anchor.set(0.5);
    attractShine.x = this.data.x
    attractShine.y = this.data.y
    attractShine.alpha = 0;

    this.sprite.parent.addChild(attractShine);

    new Tween(attractShine)
      .to({ alpha: 1 }, 500)
      .easing(Easing.Quadratic.InOut)
      .yoyo(true).repeat(1)
      .start()
      .onComplete(() => {
        this.sprite.parent.removeChild(attractShine);
      });
  }

  private onPointerDown() { //_e: InteractionEvent
    // On an inventory (or draggable) item?
    if (this.inInventory || this.data.draggable) {
      // Start of drag...
      this.dragging = true;
      SAGE.World.currentScene.screen.draggedProp = this;
      this.sprite.alpha = this.DRAG_ALPHA;
      SAGE.Dialog.clearMessage();
      // Disable auto-close of inventory          
      SAGE.invScreen.autoClose = false;
    }
  }

  private onPointerOver() { //_e: InteractionEvent
    SAGE.Dialog.showMessage(this.data.name, DialogType.Caption, -1);
  }

  private onPointerOut() { //_e: InteractionEvent
    // If dialog being displayed is name "on hover"...
    // (AND not dragging this Prop)
    if (SAGE.Dialog.currentDialogType === DialogType.Caption
      && !this.dragging) {
      SAGE.Dialog.clearMessage();
    }
  }

  private onPrimaryAction() {
    SAGE.debugLog(`You interacted with a prop! (${this.data.name})`);
    // Custom action?
    if (this.data.on_action) {
      Function(this.data.on_action)();
      return;
    }
    // Can prop be picked up? 
    // (...and not already in inventory)?
    if (this.data.pickupable
      && !this.inInventory) {
      SAGE.Dialog.showMessage(`You picked up the ${this.data.name}`);
      // Remove prop from scene
      SAGE.World.currentScene.screen.removeProp(this, true, true);
      // Add to Player's inventory
      SAGE.World.player.addToInventory(this.data);
      // Play sound
      SAGE.Sound.play("Pick-Up")
      // Auto-open player inventory
      SAGE.invScreen.open(true);
      return;
    }
    // Interacted while in player inventory?
    // ...if so, perform secondary action (describe)
    if (this.inInventory) {
      this.onSecondaryAction();
      // Disable auto-close of inventory          
      SAGE.invScreen.autoClose = false;
      return;
    }
  }

  private onSecondaryAction() {
    SAGE.debugLog(`onSecondaryAction for :${this.data.id}`);
    SAGE.Dialog.showMessage(this.data.desc);
  }

}
