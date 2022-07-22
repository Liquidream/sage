import { Container, Graphics, Text, TextStyle } from "pixi.js";

export class Button extends Container {
  // "constants" 
  // (perhaps overridable in config?)
  readonly COL_PRIME = 0x0a62be;
  readonly COL_SECOND = 0x1d2b53;

  label: string
  w: number
  h: number

  public constructor(label: string, x: number, y: number, width: number, height: number) {
    super();

    this.label = label
    this.x = x
    this.y = y    
    this.w = width    // Can't use this.width/height, as it's affected by scale?
    this.h = height   //
    this.createButton();
  }

  private createButton() {
    // Show "Start Game" button    
    const btnbackground = new Graphics();
    btnbackground.lineStyle(10, this.COL_PRIME, 1);
    btnbackground.beginFill(this.COL_SECOND);
    btnbackground.pivot.set(this.w/2, this.h/2);
    // Draw a rectangle
    btnbackground.drawRoundedRect(0, 0, this.w, this.h, 30);
    btnbackground.endFill();
    this.addChild(btnbackground);
    
    const style: TextStyle = new TextStyle({
        fill: "white",
        //fontFamily: "Impact",
        fontSize: 90,
        fontWeight: "bold",
        padding: 4,
        trim: true
    });
    const text = new Text(this.label, style);
    text.anchor.set(0.5);
    this.addChild(text);
    
    this.interactive = true;// Respond to interaction 
    this.buttonMode = true;
  }  
}