import * as sound from "@pixi/sound"
import { Tween } from "tweedle.js"
import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

export class SoundEdit {
  public constructor() {
    //
  }

  public get soundLibrary(): sound.SoundLibrary {
    return sound.sound
  }

  public play(
    soundName: string
  ): sound.IMediaInstance | Promise<sound.IMediaInstance> | undefined {
    return this.playCore(soundName, false)
  }

  public playLoop(soundName: string, fadeIn: boolean) {
    SAGEdit.debugLog(`playLoop(${soundName})`)
    //fadeIn = false
    if (fadeIn) {
      const sfx = sound.sound.find(soundName)
      if (sfx) {
        sfx.volume = 0 // Doing this in one hit doesn't work??? (stays 0 volume)
        sfx.play({ loop: true }) //
        new Tween(sfx).to({ volume: 1 }, 1000).start()
      } else {
        SAGEdit.Dialog.showErrorMessage(
          `Error: Sound with ID '${soundName}' is invalid`
        )
      }
    } else {
      this.playCore(soundName, true)
    }
  }

  public stop(soundName: string, fadeOut?: boolean) {
    //fadeOut = false
    try {
      if (fadeOut) {
        const sfx = sound.sound.find(soundName)
        if (sfx) {
          new Tween(sfx)
            .to({ volume: 0 }, 1000)
            .start()
            .onComplete(() => {
              sound.sound.stop(soundName)
            })
        } else {
          SAGEdit.Dialog.showErrorMessage(
            `Error: Sound with ID '${soundName}' is invalid`
          )
        }
      } else {
        sound.sound.stop(soundName)
      }
    } catch (e) {
      SAGEdit.Dialog.showErrorMessage(
        `Error: Sound with ID '${soundName}' is invalid`
      )
    }
    return
  }

  public stopAll() {
    SAGEdit.debugLog(`>> Sound.stopAll()`)
    sound.sound.stopAll()
  }

  public toggleMute() {
    sound.sound.toggleMuteAll()
  }

  private playCore(
    soundName: string,
    loop: boolean
  ): sound.IMediaInstance | Promise<sound.IMediaInstance> | undefined {
    try {
      // Poss workaround for current iOS issues
      //sound.useLegacy = true;
      SAGEdit.debugLog(`playCore(${soundName})`)
      return sound.sound.play(soundName, { loop: loop })
    } catch (e) {
      SAGEdit.Dialog.showErrorMessage(
        `Error: Sound with ID '${soundName}' is invalid`
      )
    }
    return
  }
}
