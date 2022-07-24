import { Container, Graphics } from "pixi.js";
import { Tween } from "tweedle.js";
import { SAGE } from "../../Manager";
import { Prop } from "../Prop";

export class InventoryScreen {
  // "constants" 
  // (perhaps overridable in config?)
  HEIGHT = SAGE.width / 13;
  SIDE_MARGIN = this.HEIGHT;
  SPACING = 20
  ROUNDED_EDGE = 50
  CLOSED_YPOS = -(this.HEIGHT + this.ROUNDED_EDGE);
  OPEN_YPOS = -this.ROUNDED_EDGE;
  AUTO_CLOSE_DURATION = 3; //seconds
  ICON_ALPHA_INACTIVE = 0.5;
  ICON_ALPHA_ACTIVE = 0.85;
  ICON_HINT_TEXT = "Open/Close Inventory";

  // Fields
  private parentLayer: Container;
  private inventoryContainer: Container;
  private inventoryBackground!: Graphics;


  public propsList: Array<Prop>

  public isOpen = false;
  public autoClose = true;


  public constructor(parentLayer: Container) {
    // initialise the inventory
    this.parentLayer = parentLayer;
    this.inventoryContainer = new Container();
    this.parentLayer.addChild(this.inventoryContainer);
    this.propsList = new Array<Prop>();
    // Background
    this.createBackground();
    // Build initial inventory 
    // (will be empty, unless starting with items - e.g. by loading game)
    this.initialise();

    // Start inventory in "closed" state
    this.inventoryContainer.y = this.CLOSED_YPOS;
  }

  private initialise() {
    // Create and add objects for initial inventory
    for (const propData of SAGE.World.player.inventory) {
      this.addProp(new Prop(propData));
    }
  }

  public addProp(prop: Prop) {
    // Prep the sprite for the inventory
    // TODO: Use "Inventory" image, if specified
    const propSprite = prop.sprite;
    // Resize against longest edge
    if (propSprite.height > propSprite.width) {
      propSprite.height = this.HEIGHT;
      propSprite.scale.x = propSprite.scale.y;
    } else {
      propSprite.width = this.HEIGHT;
      propSprite.scale.y = propSprite.scale.x;
    }
    this.inventoryContainer.addChild(propSprite);
    // Now add to list and update the display
    this.propsList.push(prop);
    this.update();
    // Animate it
    propSprite.alpha = 0
    new Tween(propSprite).to({ alpha: 1 }, 500).start()
  }

  public removeProp(propId: string): Prop | undefined {
    const index = this.propsList.findIndex(item => item.data.id === propId)
    let prop: Prop | undefined;
    if (index !== -1) prop = this.propsList.splice(index, 1)[0];
    if (prop) {
      const propSprite = prop.sprite;
      // Animate it
      propSprite.alpha = 1
      new Tween(propSprite).to({ alpha: 0 }, 500).start()
        .onComplete(() => {
          if (prop) this.inventoryContainer.removeChild(prop.sprite);
          this.update();
        })
      return prop;
    }
    return;
  }

  public open(isAutoOpen: boolean) {
    new Tween(this.inventoryContainer).to({ y: 0 }, 500).start()
      .onComplete(async () => {
        if (this.autoClose) await SAGE.Script.wait(this.AUTO_CLOSE_DURATION);
        if (this.autoClose) this.close();
      });
    SAGE.UI_Overlay.inventoryIcon.alpha = this.ICON_ALPHA_ACTIVE;
    this.isOpen = true;
    this.autoClose = isAutoOpen;
  }

  public close() {
    new Tween(this.inventoryContainer).to({ y: this.CLOSED_YPOS }, 500).start()
    SAGE.UI_Overlay.inventoryIcon.alpha = this.ICON_ALPHA_INACTIVE;
    this.isOpen = false;
  }

  // Updates position of inventory items
  update() {
    let xOff = this.HEIGHT / 2;
    // Add each item        
    for (const prop of this.propsList) {
      const propSprite = prop.sprite;
      propSprite.x = this.SIDE_MARGIN + xOff;
      propSprite.y = this.HEIGHT / 2;
      xOff += this.HEIGHT;
    }
  }

  private createBackground() {
    this.inventoryBackground = new Graphics();
    this.inventoryBackground.beginFill(0x0);
    this.inventoryBackground.alpha = 0.6;
    this.inventoryBackground.drawRoundedRect(this.SIDE_MARGIN, this.OPEN_YPOS, SAGE.width - (this.SIDE_MARGIN * 2), this.HEIGHT + this.ROUNDED_EDGE, this.ROUNDED_EDGE);
    this.inventoryBackground.endFill();
    this.inventoryContainer.addChild(this.inventoryBackground);
    // Events
    // (Make bg receive input, so that can't be clicked "through" + cancel auto-close)
    this.inventoryBackground.interactive = true;
    this.inventoryBackground.on("pointertap", () => {
      this.autoClose = false;
    });
    this.inventoryBackground.on("pointerover", () => {
      this.autoClose = false;
    });
  }

}