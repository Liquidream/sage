import { DropShadowFilter } from "pixi-filters";
import { Container, Sprite } from "pixi.js";
import { SAGE } from "../../Manager";
import { Fullscreen } from "../../utils/Fullscreen";
import { DialogType } from "../Dialog";


export class UI_Overlay {
  // "constants" 
  // (perhaps overridable in config?)
  ICON_ALPHA_INACTIVE = 0.5;
  ICON_ALPHA_ACTIVE = 0.85;
  ICON_HINT_TEXT = "Open/Close Inventory";

  // Fields
  private parentLayer: Container;
  private settingsIcon!: Sprite;
  public inventoryIcon!: Sprite;
  private iconYPos = (SAGE.width / 13) / 2;

  public constructor(parentLayer: Container) {
    // initialise the inventory
    this.parentLayer = parentLayer;
    this.initialise();
  }

  private initialise() {
    // ---------------------------
    // Settings icon
    // ---------------------------
    this.settingsIcon = Sprite.from("UI-Settings");
    this.settingsIcon.anchor.set(0.5);
    this.settingsIcon.x = this.iconYPos;
    this.settingsIcon.y = this.iconYPos;
    this.settingsIcon.anchor.set(0.5);
    this.settingsIcon.alpha = this.ICON_ALPHA_INACTIVE;
    const dropShadow = new DropShadowFilter();
    dropShadow.alpha = 1;
    this.settingsIcon.filters = [dropShadow]
    this.settingsIcon.interactive = true;
    this.settingsIcon.buttonMode = true;
    // Events
    this.settingsIcon.on("pointertap", () => {
      // Toggle fullscreen (for now)
      Fullscreen.toggleFullScreen();
    });
    this.parentLayer.addChild(this.settingsIcon);
    // ---------------------------
    // Inventory icon
    // ---------------------------
    const HEIGHT = SAGE.width / 13;
    this.inventoryIcon = Sprite.from("UI-Inventory");
    this.inventoryIcon.anchor.set(0.5);
    this.inventoryIcon.x = SAGE.width - (HEIGHT / 2);
    this.inventoryIcon.y = HEIGHT / 2;
    this.inventoryIcon.anchor.set(0.5);
    this.inventoryIcon.alpha = this.ICON_ALPHA_INACTIVE;
    this.inventoryIcon.filters = [dropShadow]
    this.inventoryIcon.interactive = true;
    this.inventoryIcon.buttonMode = true;
    // Events
    this.inventoryIcon.on("pointertap", () => {
      if (SAGE.invScreen.isOpen)
        SAGE.invScreen.close();
      else
        SAGE.invScreen.open(false);
    });
    this.inventoryIcon.on("pointerover", () => {
      this.inventoryIcon.alpha = this.ICON_ALPHA_ACTIVE;
      SAGE.Dialog.showMessage(this.ICON_HINT_TEXT, DialogType.Caption, -1);
    });
    this.inventoryIcon.on("pointerout", () => {
      if (!SAGE.invScreen.isOpen) this.inventoryIcon.alpha = this.ICON_ALPHA_INACTIVE;
      // If dialog being displayed is name "on hover"...
      if (SAGE.Dialog.currentDialogType === DialogType.Caption) {
        SAGE.Dialog.clearMessage();
      }
    });
    //
    this.parentLayer.addChild(this.inventoryIcon);
  }


  public showSettings() {
    throw new Error("Method not implemented.");
  }

  closeSettings() {
    throw new Error("Method not implemented.");
  }

}