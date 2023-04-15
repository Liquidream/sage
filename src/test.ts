import { Application, Assets, Sprite } from "pixi.js"

const app = new Application({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: 0x6495ed,
  width: 640,
  height: 480,
})

//const clampy: Sprite = Sprite.from("clampy.png")

// WORKS
//const clampy: Sprite = Sprite.from("debug.png")

// ERRORS
Assets.load("./clampy.png").then((clampyTexture) => {
  const clampy = Sprite.from(clampyTexture)
  clampy.anchor.set(0.5)
  
  clampy.x = app.screen.width / 2
  clampy.y = app.screen.height / 2
  
  app.stage.addChild(clampy)
})

