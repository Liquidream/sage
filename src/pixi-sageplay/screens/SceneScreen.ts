import { Group, Tween } from "tweedle.js"; //Easing
import { Container, Sprite, Graphics, Text, TextStyle, Texture, InteractionEvent, Point } from "pixi.js"; //filters

import { IScreen, SAGE } from "../Manager";
import { Scene } from "../sage/Scene";
import { Prop } from "../sage/Prop";
import { Door } from "../sage/Door";
import { PropData } from "../sage/PropData";
import { InputEventEmitter } from "../sage/ui/InputEventEmitter";
import { Collision } from "../utils/Collision";


export class SceneScreen extends Container implements IScreen {
  private scene: Scene;
  private backdrop!: Sprite;
  private props: Array<Prop> = [];
  private doors: Array<Door> = [];

  public draggedProp!: Prop | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dragTarget!: any; // Could be Prop or Door
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public touchTarget!: any; // Could be Prop or Door

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore (ignore the "declared but never used" for now)
  private backdropInputEvents!: InputEventEmitter;

  constructor(scene: Scene) {
    super();

    // Ref to scene data
    this.scene = scene;

    // Construct scene from data
    this.buildBackdrop();
    this.buildDoorways();
    this.buildProps();

    // Fade in scene music
    if (this.scene.sound) {
      SAGE.Sound.playLoop(this.scene.sound, true);
    }

    // Drag+Drop support
    SAGE.app.stage.interactive = true;
    SAGE.app.stage.on("pointermove", this.onPointerMove, this);
    SAGE.app.stage.on("pointerup", this.onPointerUp, this);
    SAGE.app.stage.on("touchmove", this.onTouchMove, this);
  }

  public update() {  //{(_framesPassed: number): void {
    // Do any movement here...

    //You need to update a group for the tweens to do something!
    Group.shared.update();
  }

  // public resize(_screenWidth: number, _screenHeight: number): void {
  //     // Anything?
  // }

  public tidyUp(restartGame?: boolean) {
    SAGE.debugLog(`>> SceneScreen tidyUp()`)
    // Unsubscribe from events, etc.
    for (const prop of this.props) {
      prop.tidyUp();
    }
    for (const door of this.doors) {
      door.tidyUp();
    }
    SAGE.app.stage.off("pointermove", this.onPointerMove, this);
    SAGE.app.stage.off("pointerup", this.onPointerUp, this);
    SAGE.app.stage.off("touchmove", this.onTouchMove, this);

    // Fade out scene music
    if (this.scene.sound) {
      SAGE.Sound.stop(this.scene.sound, !restartGame);
    }
  }

  public showGameWon(message: string) {
    this.showGameEndScreen(message, "Press to Play again", 0x00e436);
  }

  public showGameOver(message: string) {
    this.showGameEndScreen(message, "Press to Restart", 0xbe1226);
  }

  private onPointerMove(_e: InteractionEvent) {
    SAGE.debugLog(`${this.name}::onPointerMove()`);
    if (this.draggedProp) {
      // Temp remove interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = false
      // Update pos
      this.draggedProp.sprite.x = _e.data.global.x;
      this.draggedProp.sprite.y = _e.data.global.y;
      // Check for valid "drop"
      this.checkDragCollisions();
    }
  }

  private onPointerUp() { //_e: InteractionEvent) {
    SAGE.debugLog(`${this.name}::onPointerUp()`);
    if (this.draggedProp) {
      // We were dragging something - did we drop it on something?
      if (this.dragTarget) {
        // Was it a valid object?
        this.draggedProp.use(this.dragTarget);
      }
      else {
        // Didn't drop on object, so... do nothing? (+put back to orig pos)
        this.draggedProp.sprite.x = this.draggedProp.data.x;
        this.draggedProp.sprite.y = this.draggedProp.data.y;
      }
      // End Drag+Drop mode
      this.draggedProp.dragging = false
      // Restore interaction to "dragged" Prop
      this.draggedProp.sprite.interactive = true
      this.draggedProp.sprite.alpha = 1;
      this.draggedProp = undefined;
      // Update inventory (in case it was an inventory prop)
      SAGE.invScreen.update();
    }
  }

  private onTouchMove(_e: InteractionEvent) {
    SAGE.debugLog(`${this.name}::onTouchMove()`);
    // Get touch position
    const touchPoint: Point = new Point();
    _e.data.getLocalPosition(this, touchPoint, _e.data.global)
    // Check for any collisions...
    const result = this.checkTouchCollisions(touchPoint);
    if (result) {
      if (this.touchTarget)
        this.touchTarget.onPointerOver();
      else
      SAGE.Dialog.clearMessage();
    }
  }

  private checkDragCollisions() {
    // Check selected/dragged Prop with
    let currTarget = undefined;
    //  > Other Props in inventory
    for (const prop of SAGE.invScreen.propsList) {
      if (Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.data.name}`)
        currTarget = prop;
      }
    }
    //  > Other Props in current scene
    for (const prop of this.props) {
      if (Collision.isCollidingObjToObj(this.draggedProp?.sprite, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.data.name}`)
        currTarget = prop;
      }
    }
    //  > Doors in current scene
    for (const door of this.doors) {
      if (Collision.isCollidingObjToObj(this.draggedProp?.sprite, door.graphics)) {
        SAGE.debugLog(`>> collided with ${door.data.name}`)
        currTarget = door;
      }
    }

    // If collision, then highlight source AND target 
    // (...and remember if "dropped" on it)
    if (currTarget !== this.dragTarget) {
      if (currTarget) {
        // Different target...
        SAGE.debugLog(`>> new target = ${currTarget.data.name}`)
      }
      else {
        // Lost target
        SAGE.debugLog(`>> NO target`)
      }
      this.dragTarget = currTarget;
    }
  }

  private checkTouchCollisions(touchPoint: Point): boolean {
    // Check selected/dragged Prop with
    let currTarget = undefined;
    //  > Other Props in inventory
    for (const prop of SAGE.invScreen.propsList) {
      if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.data.name}`)
        currTarget = prop;
      }
    }
    //  > Other Props in current scene
    for (const prop of this.props) {
      if (Collision.isCollidingPointToObj(touchPoint, prop.sprite)) {
        SAGE.debugLog(`>> collided with ${prop.data.name}`)
        currTarget = prop;
      }
    }
    //  > Doors in current scene
    for (const door of this.doors) {
      if (Collision.isCollidingPointToObj(touchPoint, door.graphics)) {
        SAGE.debugLog(`>> collided with ${door.data.name}`)
        currTarget = door;
      }
    }

    // If collision, then highlight source AND target 
    // (...and remember if "dropped" on it)
    if (currTarget !== this.touchTarget) {
      if (currTarget) {
        // Different target...
        SAGE.debugLog(`>> new target = ${currTarget.data.name}`)
      }
      else {
        // Lost target
        SAGE.debugLog(`>> NO target`)
      }
      this.touchTarget = currTarget;
      return true;
    }
    return false;
  }

  /**
   * Start the player death/game over sequence
   * @param message The message to display to player
   */
  private showGameEndScreen(message: string, actionMessage: string, backgroundColour: number): void {
    // Red overlay
    const overlay = new Graphics();
    overlay.beginFill(backgroundColour);
    overlay.alpha = 0;
    overlay.drawRect(0, 0, SAGE.width, SAGE.height);
    overlay.endFill();
    overlay.interactive = true;   // Super important or the object will never receive mouse events!
    overlay.on("pointertap", this.onClickGameOver, this);
    this.addChild(overlay);
    // Animate it...
    new Tween(overlay).to({ alpha: 0.8 }, 1000).start()
      .onComplete(() => {
        // Now show action message
        const style = new TextStyle({
          fill: "white",
          fontFamily: "Impact",
          fontSize: 48,
          lineJoin: "round",
          padding: 4,
          strokeThickness: 10,
          trim: true
        });
        const text = new Text(actionMessage, style);
        text.anchor.set(0.5);
        text.x = SAGE.width / 2;
        text.y = SAGE.height / 1.5;
        overlay.addChild(text);
      });
    // "Game Over"
    const style = new TextStyle({
      fill: "white",
      fontFamily: "Impact",
      fontSize: 120,
      lineJoin: "round",
      padding: 4,
      strokeThickness: 10,
      trim: true
    });
    const text = new Text(message, style);
    text.anchor.set(0.5);
    text.x = SAGE.width / 2;
    text.y = SAGE.height / 2;
    overlay.addChild(text);
  }

  private onClickGameOver() { //_e: InteractionEvent
    // Restart game
    SAGE.restartGame();
  }

  private buildBackdrop() {
    // Backdrop
    let sprite = undefined;
    if (this.scene.image) {
      sprite = Sprite.from(this.scene.image);
    } else {
      sprite = new Sprite(Texture.EMPTY);
    }
    sprite.anchor.set(0.5);
    sprite.x = SAGE.width / 2;
    sprite.y = SAGE.height / 2;
    this.addChild(sprite);
    this.backdrop = sprite

    // Events
    this.backdropInputEvents = new InputEventEmitter(this.backdrop);
    this.backdrop.on("primaryaction", this.onPrimaryAction, this);
    this.backdrop.on("secondaryaction", this.onSecondaryAction, this);
  }

  private buildProps() {
    // Only create Lamp if not already "picked up"
    // TODO: Make this all dynamic/data-based eventually, this is just a crude example!
    if (this.scene.props.length > 0) {

      for (const propData of this.scene.props) {
        this.addProp(propData);
      }
    }

    SAGE.Dialog.clearMessage();
  }

  public addProp(data: PropData, fadeIn = false) {
    // Create new component obj (contains data + view)
    const prop = new Prop(data);
    this.addChild(prop.sprite);
    this.props.push(prop);
    // Don't add to scene.propdata here, as it likely already came from it?

    // Fade in?
    if (fadeIn) {
      prop.sprite.alpha = 0;
      new Tween(prop.sprite).to({ alpha: 1 }, 500).start();
    }

    // DEBUG?
    if (SAGE.debugMode) {
      const graphics = new Graphics();
      graphics.beginFill(0xe74c3c, 125); // Red
      graphics.lineStyle(10, 0xFF0000);
      graphics.pivot.set(prop.sprite.width / 2, prop.sprite.height / 2);
      // Need to handle diff for "non-image" sprites
      // (as Graphics scaling goes screwy if image dimensions are not really there)
      if (prop.data.image) {
        graphics.drawRoundedRect(0, 0, prop.sprite.width, prop.sprite.height, 30);
        prop.sprite.addChild(graphics);
      } else {
        graphics.drawRoundedRect(prop.sprite.x, prop.sprite.y, prop.sprite.width, prop.sprite.height, 30);
        this.addChild(graphics);
      }
      graphics.endFill();
    }
  }

  /**
   * Removes a Prop from a scene (default = fade out).     
   */
  removeProp(prop: Prop, fadeOut = true, scaleAnim?: boolean) {
    if (fadeOut) {
      new Tween(prop.sprite).to({ alpha: 0 }, 500).start()
        .onComplete(() => { // https://bobbyhadz.com/blog/typescript-this-implicitly-has-type-any                
          // remove when tween completes
          this.removeChild(prop.sprite);
          const index = this.props.findIndex(item => item.data.id === prop.data.id)
          if (index !== -1) this.props.splice(index,1);
          prop.tidyUp();
          // remove from game data
          this.scene.removePropDataById(prop.data.id)
        });
    }
    if (scaleAnim) {
      new Tween(prop.sprite.scale).to({ x: 1.5, y: 1.5 }, 500).start()
    }
  }

  private buildDoorways() {
    if (this.scene.doors.length > 0) {
      for (const doorData of this.scene.doors) {
        // Create new component obj (contains data + view)
        const door = new Door(doorData);
        this.addChild(door.graphics);
        this.doors.push(door);
      }
    }
    SAGE.Dialog.clearMessage();
  }

  private onPrimaryAction() { //_e: InteractionEvent
    SAGE.debugLog("Backdrop was clicked/tapped");
    SAGE.Events.emit("sceneinteract");
  }

  private onSecondaryAction() { //_e: InteractionEvent
    // Make all interactive objects flash (by raising 'global' event)");
    SAGE.Events.emit("scenehint");
  }

}