import { Graphics, Sprite } from "pixi.js";
import { Easing, Tween } from "tweedle.js";
import { SAGE } from "../Manager";
import { DialogType } from "./Dialog";
import { DoorState, IDoorData } from "./DoorData";
import { InputEventEmitter } from "./ui/InputEventEmitter";

export class Door {
  // "constants" 
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500;

  public data!: IDoorData;
  public graphics!: Graphics;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private doorInputEvents!: InputEventEmitter;


  public constructor(doorData: IDoorData) {
    // Initialise from data object
    this.data = doorData;
    const graphics = new Graphics();
    // Make doors visible in debug
    if (SAGE.debugMode) {
      // Set the fill color
      graphics.beginFill(0xe74c3c, 125); // Red
      // Line/stroke style
      graphics.lineStyle(10, 0xFF0000);
    }
    else {
      // Set the fill color to barely visible 
      // (else won't get collision hit)
      // TODO: find a nicer solution to this!
      graphics.beginFill(0xccc, 0.00000000000001); // "Invisible"
    }
    // Make a center point of origin (anchor)
    graphics.pivot.set(this.data.width / 2, this.data.height / 2);
    // Draw a rectangle
    graphics.drawRoundedRect(this.data.x, this.data.y, this.data.width, this.data.height, 30);
    // Applies fill to lines and shapes since the last call to beginFill.
    graphics.endFill();

    // Events
    this.doorInputEvents = new InputEventEmitter(graphics);
    graphics.on("primaryaction", this.onPrimaryAction, this);
    graphics.on("secondaryaction", this.onSecondaryAction, this);
    // Hover (info)
    graphics.on("pointerover", this.onPointerOver, this);
    graphics.on("pointerout", this.onPointerOut, this);
    //
    SAGE.Events.on("scenehint", this.onSceneHint, this);

    this.graphics = graphics;
  }

  public unlockDoor() {
    // Unlock the door
    this.data.state = DoorState.Unlocked;
    // Play sound
    if (this.data.playSounds) {
      SAGE.Sound.play("Unlock-Door");
    }
  }

  tidyUp() {
    // Unsubscribe from events, etc.
    this.graphics.removeAllListeners();
    SAGE.Events.off("scenehint", this.onSceneHint, this);
  }

  private onSceneHint() {
    // Show attract tween for this
    const attractShine: Sprite = Sprite.from("UI-Shine");
    attractShine.anchor.set(0.5);
    attractShine.x = this.data.x
    attractShine.y = this.data.y
    attractShine.alpha = 0;

    this.graphics.parent.addChild(attractShine);

    new Tween(attractShine)
      .to({ alpha: 1 }, 500)
      .easing(Easing.Quadratic.InOut)
      .yoyo(true).repeat(1)
      .start()
      .onComplete(() => {
        this.graphics.parent.removeChild(attractShine);
      });
  }

  private onPointerOver() { //_e: InteractionEvent
    if (SAGE.debugMode) console.log(`${this.data.name}::onPointerOver()`);
    SAGE.Dialog.showMessage(this.data.name, DialogType.Caption, -1);
  }

  private onPointerOut() { //_e: InteractionEvent
    // If dialog being displayed is name "on hover"...
    if (SAGE.Dialog.currentDialogType === DialogType.Caption) {
      SAGE.Dialog.clearMessage();
    }
  }

  private onPrimaryAction() {
    if (SAGE.debugMode) console.log(`door > target_scene_id: ${this.data.target_scene_id}, state:${this.data.state}`);
    // Check door state
    if (this.data.state == DoorState.Locked) {
      // Does player have the key?
      const key = SAGE.World.player.inventory.find((obj) => {
        return obj.id === this.data.key_prop_id;
      });
      if (this.data.auto_unlock && key) {
        // Unlock the door
        this.unlockDoor();
        // Remove item from inventory (unless not single-use)
        if (key.single_use) {
          SAGE.World.player.removeFromInventory(key.id)
        }
      }
      else {
        SAGE.Dialog.showMessage(this.data.desc_locked || "It is locked");
        // Play sound
        if (this.data.playSounds) {
          SAGE.Sound.play("Locked-Door");
        }
        return;
      }
    }

    // TODO: Find the target door/scene
    // const first: {id: number; language: string;} | undefined
    const targetScene = SAGE.World.scenes.find((obj) => {
      return obj.id === this.data.target_scene_id;
    });

    if (targetScene) {
      // Change scene to the game scene!
      targetScene.show();
    }
    // Custom action?
    else if (this.data.on_action) {
      Function(this.data.on_action)();
      return;
    }
    else {
      SAGE.Dialog.showErrorMessage(`Error: Scene with ID '${this.data.target_scene_id}' is invalid`);
    }
  }

  private onSecondaryAction() {
    if (SAGE.debugMode) console.log(`onSecondaryAction for :${this.data.id}`);
    SAGE.Dialog.showMessage(this.data.desc);
  }


}