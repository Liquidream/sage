export interface ActorModel {
  id: string //also used for audio ref/prefix?
  name: string
  col?: string
  desc?: string // Poss having diff desc's for each state?
  x?: number
  y?: number
  width?: number
  height?: number
  orig_width?: number
  orig_height?: number
  scale?: number
  preserve_aspect?: boolean
  image?: string // Poss multiple, for each state?
  image_closeup?: string // Poss multiple, for each state?
  state?: string // e.g. "happy", "dead", etc.
  visible?: boolean
  // in_scene_id?: string
  location_type?: ActorLocationType
  location_id?: string

  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_interact?: string
}

export enum ActorLocationType {
  Unknown = "UNKNOWN",
  Scene = "SCENE",
  CloseUp = "CLOSEUP", // Do we want this?
}
