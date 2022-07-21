import { Container, Graphics, Loader } from "pixi.js";
import { assets } from "../assets";
import { IScreen, SAGE } from "../Manager";
import { Button } from "../sage/ui/Button";
import { Fullscreen } from "../utils/Fullscreen";

export class LoaderScreen extends Container implements IScreen {
  // Colour scheme
  readonly colPrime = 0x0a62be;
  readonly colSecond = 0x1d2b53;

  // for making our loader graphics...
  private loaderBar: Container;
  private loaderBarBorder: Graphics;
  private loaderBarFill: Graphics;
  constructor() {
    super();

    const loaderBarWidth = SAGE.width * 0.7;
    const loaderBarHeight = SAGE.height * 0.1;

    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(this.colPrime, 1)
    this.loaderBarFill.drawRect(0, 0, loaderBarWidth, loaderBarHeight);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0;

    this.loaderBarBorder = new Graphics();
    this.loaderBarBorder.lineStyle(10, this.colSecond, 1);
    this.loaderBarBorder.drawRect(0, 0, loaderBarWidth, loaderBarHeight);

    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill);
    this.loaderBar.addChild(this.loaderBarBorder);
    this.loaderBar.position.x = (SAGE.width - this.loaderBar.width) / 2;
    this.loaderBar.position.y = (SAGE.height - this.loaderBar.height) / 2;
    this.addChild(this.loaderBar);

    Loader.shared.add(assets);

    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onComplete.once(this.gameLoaded, this);

    Loader.shared.load();
  }

  public update() { //_framesPassed: number) {
    // To be a scene we must have the update method even if we don't use it.
  }

  // public resize(_screenWidth: number, _screenHeight: number) {

  // }

  private downloadProgress(loader: Loader) {
    const progressRatio = loader.progress / 100;
    this.loaderBarFill.scale.x = progressRatio;
  }

  private gameLoaded() {
    // Remove loading bar
    this.removeChild(this.loaderBar);

    if (SAGE.enableFullscreen)
      this.showStartButton();
    else {
      SAGE.loadWorld();
      SAGE.startGame();
    }
  }

  private showStartButton() {
    // Make a center point of origin (anchor)
    const x = SAGE.width / 2
    const y = SAGE.height / 2
    const w = 550
    const h = 175

    const button = new Button("Start Game", x, y, w, h)
    this.addChild(button)
    button.on("pointertap", () => {
      // Launch fullscreen
      Fullscreen.openFullscreen();
      // Change scene to the game scene!
      SAGE.loadWorld();
      SAGE.startGame();
    })
  }

}