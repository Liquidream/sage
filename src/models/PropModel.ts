import { Graphics } from "pixi.js"
import { SAGE } from "@/SAGE"
//import { PixiApp } from "@/app/PixiApp"
//import { Prop } from "./Prop";

export class PropModel {
  private _X = 500
  private _Y = 100

  graphy?: Graphics
  //prop?: Prop

  constructor() {
    //
  }

  createCircle() {
    this.graphy = new Graphics()
    // we give instructions in order. begin fill, line style, draw circle, end filling
    this.graphy.beginFill(0xff00ff)
    this.graphy.lineStyle(10, 0x00ff00)
    this.graphy.drawCircle(0, 0, 50) // See how I set the drawing at 0,0? NOT AT 100, 100!
    this.graphy.endFill()
    SAGE.app.stage.addChild(this.graphy) //I can add it before setting position, nothing bad will happen.
    // Here we set it at 100,100
    this.graphy.x = 500
    this.graphy.y = 100
  }

  move(moveX?: number, moveY?: number) {
    this._X = moveX ?? this._X
    this._Y = moveY ?? this._Y

    if (this.graphy) {
      this.graphy.position.set(this._X, this._Y)
    }
  }

  get X(): number {
    return this._Y
  }

  set X(value: number) {
    this.move(value, undefined)
  }

  get Y(): number {
    return this._Y
  }

  set Y(value: number) {
    this.move(undefined, value)
  }
}
