//import { EventEmitter } from '@pixi/utils';
//import { SAGE } from "@/SAGE"
import type { DisplayObject } from "pixi.js"

export class InputEventEmitter {
  //extends EventEmitter {
  // "constants"
  // (perhaps overridable in config?)
  TOUCH_DURATION = 500

  dispObj: DisplayObject

  constructor(dispObj: DisplayObject) {
    //super();

    this.dispObj = dispObj

    // Subscribe to mouse/touch events so we can normalise them later
    // mouse
    this.dispObj.on("click", this.onClick, this)
    this.dispObj.on("rightclick", this.onRightClick, this)
    // mobile/touch
    this.dispObj.on("touchstart", this.onTouchStart, this)
    this.dispObj.on("touchend", this.onTouchEnd, this) // Both touch "tap" & "long-press"

    this.dispObj.interactive = true // Super important or the object will never receive mouse events!
  }

  // -------------------------------------------------------------
  // Platform-specific event handlers
  //
  private onClick() {
    this.onPrimaryAction()
  }

  private onRightClick() {
    this.onSecondaryAction()
  }

  private touchTimer: NodeJS.Timeout | undefined
  private longPressFired = false
  private touchStartTime!: Date

  private onTouchStart() {
    //_e: InteractionEvent
    //SAGE.debugLog("onTouchStart...")
    this.touchStartTime = new Date()
    this.touchTimer = setTimeout(() => {
      // if (!SAGE.World.currentScene.screen.draggedProp) {
      //   this.onSecondaryAction()
      //   this.longPressFired = true
      // }
    }, this.TOUCH_DURATION)
    // Reset state
    this.longPressFired = false
  }

  // https://stackoverflow.com/questions/6139225/how-to-detect-a-long-touch-pressure-with-javascript-for-android-and-iphone
  private onTouchEnd() {
    //SAGE.debugLog("onTouchEnd...")
    if (this.touchStartTime) {
      const touchEndTime = new Date()
      const timeDiffSecs =
        (touchEndTime.getTime() - this.touchStartTime.getTime()) / 1000

      if (
        !this.longPressFired &&
        //  !SAGE.World.currentScene.screen.draggedProp &&
        timeDiffSecs < 1
      )
        this.onPrimaryAction()
      //stops short touches from firing the event
      if (this.touchTimer) clearTimeout(this.touchTimer) // clearTimeout, not cleartimeout..
    }
  }

  // -------------------------------------------------------------
  // Normalised event handlers
  //

  private onPrimaryAction() {
    this.dispObj.emit("primaryaction")
  }

  private onSecondaryAction() {
    this.dispObj.emit("secondaryaction")
  }
}
