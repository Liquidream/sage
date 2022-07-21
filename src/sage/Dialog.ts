import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { SAGE } from "../Manager";


export class DialogChoice {

  message: string;
  func: () => void;
  conditionProperty!: string | undefined;
  text!: Text;

  /**
   * 
   * @param message Message to display
   * @param func Function to run when choice selected
   * @param conditionProperty Property name that must exist in order for choice to be displayed
   */
  public constructor(message: string, func: () => void, conditionProperty?: string) {
    this.message = message;
    this.func = func;
    this.conditionProperty = conditionProperty;
  }
}


export class Dialog {
  // "constants" 
  // (perhaps overridable in config?)
  CHARS_PER_SEC = 15;
  MIN_DURATION_SEC = 1.5;
  MAX_DURATION_SEC = 7;
  BACKGROUND_MARGIN = 20;
  CHOICE_MARGIN = 5;

  private speakerCols: { [id: string]: string; } = {};
  private dialogContainer!: Container | null;
  private dialogBackground!: Graphics | null;
  private dialogText!: Text | null;
  private dialogSoundName!: string;
  private dialogCol!: string;
  private blocker!: Graphics | null;
  private _dialogChoices!: Array<DialogChoice> | null;
  private suppressChoiceSelectRepeat!: boolean;

  // Key-Value pair to allow properties to be set/read
  public property: { [key: string]: string | number | boolean } = {};


  public constructor() {
    //
  }

  // Allow others to access (to insert/inspect/remove options?)
  public get dialogChoices(): Array<DialogChoice> | null {
    return this._dialogChoices;
  }

  //public currentDialogText!: Text | null;
  public currentDialogType!: DialogType | null;

  // public initialize(): void {
  //     // Anything?
  // }

  // public update() {
  //   // Anything?
  // }

  public async reshowChoices(): Promise<void> {
    // Used for re-showing existing dialog choices
    if (this.dialogChoices) return this.showChoices(this.dialogChoices);
  }

  public async showChoices(choiceList: Array<DialogChoice>,
    options?: { col?: string, suppressChoiceSelectRepeat?: boolean }): Promise<void> {

    // Are we already displaying something? 
    if (this.dialogBackground) {
      // clear existing message
      this.clearMessage()
    }

    // Is this a re-show?
    if (this._dialogChoices) {
      // Do anything diff for reshow here...
    }
    else {
      // New dialog list...
      this._dialogChoices = choiceList;
      // Default to always display/play selected choice dialog
      this.suppressChoiceSelectRepeat = false
      if (options?.suppressChoiceSelectRepeat) this.suppressChoiceSelectRepeat = options.suppressChoiceSelectRepeat;

      // Add "blocker" for all other input except dialog choices
      // (only do this once, per dialog choice menu init)
      this.blocker = new Graphics();
      this.blocker.beginFill(0xccc, 0.00000000000001); // "Invisible"
      this.blocker.drawRect(0, 0, SAGE.width, SAGE.height);
      this.blocker.interactive = true;
      this.blocker.on("pointertap", () => {
        SAGE.debugLog("Blocker was clicked/tapped");
        SAGE.Events.emit("sceneinteract");
      })
      SAGE.app.stage.addChild(this.blocker);
    }

    // Create interactive Pixi Text objects + handle events!

    // Text style
    this.dialogCol = options?.col || this.dialogCol || "#fff";
    this.dialogContainer = new Container();
    SAGE.app.stage.addChild(this.dialogContainer);

    let yOffset = 0;
    for (const choice of this._dialogChoices) {
      // Check for condition (e.g. should we show this choice yet?)
      if (choice.conditionProperty
        && !this.property[choice.conditionProperty]) {
        // skip, as specified condition not yet met
        continue;
      }

      const style: TextStyle = new TextStyle({
        align: "left",
        fill: this.dialogCol,
        fontSize: 47,
        strokeThickness: 6,
        lineJoin: "round",
        wordWrap: true,
        wordWrapWidth: SAGE.width / 2,
      });
      // Bullet
      // ================================================================================
      // NOTE: the unicode char breaks debugging, use ">" instead while debugging!
      // ================================================================================
      const bullet = new Text("▸", style); 
      bullet.x = 0;
      bullet.y = yOffset;
      this.dialogContainer.addChild(bullet);
      // Choice
      choice.text = new Text(choice.message, style); // Text supports unicode!
      choice.text.x = 46;
      choice.text.y = yOffset;
      this.dialogContainer.addChild(choice.text);
      yOffset += choice.text.height + this.CHOICE_MARGIN;
      // Events
      bullet.interactive = true;   // Super important or the object will never receive mouse events!
      choice.text.interactive = true;   // Super important or the object will never receive mouse events!
      // >> On Selected...
      const funcSelect = async () => {
        if (!this.suppressChoiceSelectRepeat) await SAGE.Dialog.showMessage(choice.message);
        // Run the choice's function
        try {
          await choice.func();
        }
        catch (e: unknown) {
          if (e instanceof Error) {
            SAGE.Dialog.showErrorMessage(`Error: Func for choice threw the following: ${e.message}`);
          }
        }
        // Remove "used" choice
        const index = this.dialogChoices?.findIndex(dChoice => dChoice.message === choice.message)
        if (index && index !== -1) this.dialogChoices?.splice(index, 1);
        // Re-show choices
        SAGE.Dialog.reshowChoices();
      };

      bullet.on("pointertap", funcSelect);
      choice.text.on("pointertap", funcSelect);
      // >> On Mouse Over...
      const funcOver = () => {
        choice.text.style.fill = "yellow"
      }
      bullet.on("mouseover", funcOver);
      choice.text.on("mouseover", funcOver);
      // >> On Mouse Out...
      const funcOut = () => {
        choice.text.style.fill = this.dialogCol
      }
      bullet.on("mouseout", funcOut);
      choice.text.on("mouseout", funcOut);
    }

    this.dialogContainer.pivot.set(this.dialogContainer.width / 2, this.dialogContainer.height / 2);
    this.dialogContainer.x = SAGE.width / 2;
    this.dialogContainer.y = SAGE.height - (this.dialogContainer.height / 2) - 80;

    // Background for all dialog
    this.dialogBackground = new Graphics();
    this.dialogBackground.beginFill(0x0);
    this.dialogBackground.alpha = 0.6;
    this.dialogBackground.drawRoundedRect(
      -this.BACKGROUND_MARGIN,
      -this.BACKGROUND_MARGIN,
      this.dialogContainer.width + (3 * this.BACKGROUND_MARGIN),
      this.dialogContainer.height + (2 * this.BACKGROUND_MARGIN),
      10);
    this.dialogBackground.endFill();
    this.dialogContainer.addChildAt(this.dialogBackground, 0);
  }

  public end() {
    // Tidy up any existing message on display
    this.clearMessage();
    // Tidy up any dialog choice related content
    if (this.blocker) {
      this.blocker.interactive = false;
      SAGE.app.stage.removeChild(this.blocker);
      this.blocker.destroy();
      this.blocker = null;
    }
    this._dialogChoices = null;
  }

  public async say(speaker: string, message: string, speakerCol?: string, soundName?: string, durationInSecs?: number): Promise<void> {
    // Show dialog for speaker        
    return this.showMessageCore({
      type: DialogType.DialogExt,
      speaker: speaker,
      message: message,
      col: speakerCol,
      soundName: soundName,
      durationInSecs: durationInSecs
    })
  }

  public async showMessage(message: string, type?: DialogType, durationInSecs?: number): Promise<void> {
    // Show a white message
    return this.showMessageCore({
      type: type,
      message: message,
      col: "#fff",
      durationInSecs: durationInSecs
    })
  }

  public async showErrorMessage(errorMessage: string): Promise<void> {
    // Show a red message
    return this.showMessageCore({
      message: errorMessage,
      col: "#ff0000"
    })
  }

  public clearMessage(): void {
    if (this.dialogContainer) {
      SAGE.app.stage.removeChild(this.dialogContainer);
    }
    this.dialogText = null;
    this.dialogBackground = null;
    this.currentDialogType = null;
    this.dialogContainer = null;
  }

  private async showMessageCore(options: {
    type?: DialogType, message: string, speaker?: string, col?: string, soundName?: string, durationInSecs?: number
  }): Promise<void> {
    let waitDuration = 0;
    // Are we already displaying something? 
    if (this.dialogBackground) {
      // If so, is incoming message low priority? (e.g. hover)
      if (options.type === DialogType.Caption) {
        // Abort, leave current dialog up, as is higher priority
        // (player can always hover again, else may lose important message)
        return;
      }
      // clear existing message
      this.clearMessage()
    }

    // Useful info:
    // https://www.gamedeveloper.com/audio/how-to-do-subtitles-well-basics-and-good-practices
    // https://80.lv/articles/10-golden-rules-on-subtitles-for-games/
    // https://gameanalytics.com/blog/adding-subtitles-to-your-mobile-game-dos-and-donts/
    // https://www.gamedeveloper.com/audio/subtitles-increasing-game-accessibility-comprehension
    // https://gritfish.net/assets/Documents/Best-practice-Game-Subtitles.pdf
    // https://www.gameuidatabase.com/index.php?&scrn=162&set=1&tag=67
    // ---
    // https://www.capitalcaptions.com/services/subtitle-services-2/capital-captions-standard-subtitling-guidelines/
    // https://uxdesign.cc/a-guide-to-the-visual-language-of-closed-captions-and-subtitles-2fda5fa2a325
    // https://www.3playmedia.com/learn/popular-topics/closed-captioning/
    // https://www.w3.org/WAI/media/av/captions/
    // https://bbc.github.io/subtitle-guidelines/

    // if both speaker AND col passed...
    if (options.col && options.speaker) {
      // ...remember for future use!
      this.speakerCols[options.speaker.toUpperCase()] = options.col;
    }

    // if speaker col wasn't passed...
    // ...see whether it's been prev defined
    if (options.col === undefined
      && options.speaker
      && this.speakerCols[options.speaker.toUpperCase()]) {
      options.col = this.speakerCols[options.speaker.toUpperCase()]
    }

    // Subtitle/caption/speech
    const styly: TextStyle = new TextStyle({
      align: "center",
      fill: options.col || "#fff",
      fontSize: 47,
      strokeThickness: 6,
      lineJoin: "round",
      wordWrap: true,
      wordWrapWidth: SAGE.width / 2,
    });
    // Spoken by..?
    if (options.speaker) {
      options.message = `[${options.speaker.toUpperCase()}]\n${options.message}`;
    }
    const newDialogText = new Text(options.message, styly); // Text supports unicode!
    newDialogText.x = SAGE.width / 2;
    newDialogText.y = SAGE.height - (newDialogText.height / 2) - 80;
    newDialogText.anchor.set(0.5);
    // .text = "This is expensive to change, please do not abuse";
    this.dialogText = newDialogText;

    // Background for all dialog
    this.dialogBackground = new Graphics();
    this.dialogBackground.beginFill(0x0);
    this.dialogBackground.alpha = 0.6;
    this.dialogBackground.drawRoundedRect(
      newDialogText.x,
      newDialogText.y,
      newDialogText.width + (4 * this.BACKGROUND_MARGIN),
      newDialogText.height + (2 * this.BACKGROUND_MARGIN),
      10);
    this.dialogBackground.endFill();
    // Make a center point of origin (anchor)
    this.dialogBackground.pivot.set(this.dialogBackground.width / 2, this.dialogBackground.height / 2);

    this.dialogContainer = new Container();
    this.dialogContainer.addChild(this.dialogBackground);
    this.dialogContainer.addChild(this.dialogText);
    SAGE.app.stage.addChild(this.dialogContainer);

    // Set here, so if another dialog comes before this expires, it'll be removed
    this.currentDialogType = options.type ?? DialogType.DialogInt;

    // Sound file?
    if (options.soundName) {
      this.dialogSoundName = options.soundName;
      SAGE.Sound.play(this.dialogSoundName)
    }

    // ---------------------------------------
    // How long to display?
    //
    if (options.durationInSecs) {
      // Duration specified, so use it
      waitDuration = options.durationInSecs;
    }
    else if (options.soundName) {
      this.dialogSoundName = options.soundName;
      const sound = SAGE.Sound.soundLibrary.find(this.dialogSoundName);
      // display dialog until sound file finishes (or is stopped)
      waitDuration = sound?.duration;
    }
    else {
      // calc display duration (1 sec for every 7 chars, approx.)        
      waitDuration = clamp(options.message.length / this.CHARS_PER_SEC, this.MIN_DURATION_SEC, this.MAX_DURATION_SEC);
    }

    // Wait for duration
    // ...or leave on display (e.g. if duration = -1)
    if (waitDuration > 0) {
      // wait for calc'd duration
      await SAGE.Script.waitSkippable(waitDuration);

      // Remove message now duration over
      // - (Unlike counter method, this could create a bug where msg changed mid-show & thread clash?)            
      // Only clear dialog if we're the last message 
      // (could have been an overlap)
      if (newDialogText === this.dialogText) {
        this.clearMessage();

        const sound = SAGE.Sound.soundLibrary.find(this.dialogSoundName);
        if (sound?.isPlaying) sound.stop();
      }

      // Add a gap at end (so dialog not too close together)
      await SAGE.Script.wait(0.5);
    }
  }
}

export enum DialogType {
  Unknown,
  Caption,    // Tooltips, shown on hover (currently only for mouse input)
  DialogInt,  // Descriptions, thoughts, reactions, etc.
  DialogExt   // Talking & interacting with other characters (actors)
}

// Clamp number between two values with the following line:
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);