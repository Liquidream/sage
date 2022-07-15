import { Application } from 'pixi.js'

export class PixiApp {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  private static _app: Application

  public static initialize() {
    PixiApp._app = new Application({
      view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
      //resolution: window.devicePixelRatio || 1, // This distorts/wrong on mobile
      autoDensity: true,
      backgroundColor: 0x6495ed,
      // width: width,
      // height: height
      resizeTo: window,
    })
  }

  // PN: Expose the Application object (for now)
  // TODO: Prob come up with a better structure so top "cage" class creates it, then nested classes uses it (e.g. cage.dialog)
  public static get app(): Application {
    return PixiApp._app
  }
}
