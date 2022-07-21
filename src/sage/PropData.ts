import { Serialization } from "../utils/Serialization";

export class PropData implements IPropData, Serialization<PropData> {
    constructor() { 
        // Anything?
    } 
    
    id = "";
    image = "";
    name = "";
    desc = "";
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    pickupable = false;    
    draggable = false;    
    single_use = true;    
    visible = true;    
    // Key-Value pair to allow properties to be set/read
    property: { [key: string]: string | number | boolean } = {};
    // Poss. event actions
    on_action = "";
    on_use = "";
    
    // public initialize(): void {
        //     // Anything?
    // }

    
    fromJSON(input: IPropData) {
        Object.assign(this, input);        
        return this;
    }

    toJSON(): IPropData {
        return this;
    }
}

export interface IPropData {
    id: string;
    image: string;
    name: string;
    desc: string;
    x: number;
    y: number;
    width: number;
    height: number;
    pickupable: boolean;
    draggable: boolean;
    single_use: boolean;
    visible: boolean;    
    // Key-Value pair to allow properties to be set/read
    property: { [key: string]: string | number | boolean };
    // Poss. event actions
    on_action: string;
    on_use: string;
}