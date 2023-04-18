export interface PropModel {
  id: string
  name: string
  image?: string
  desc?: string
  x?: number
  y?: number
  width?: number
  height?: number
  pickupable?: boolean
  draggable?: boolean
  single_use?: boolean
  visible?: boolean
  // in_scene_id?: string
  location_type?: LocationType
  location_id?: string

  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_action?: string
  on_use?: string
}

export enum LocationType {
  Unknown = "UNKNOWN",
  Scene = "SCENE",
  Inventory = "INVENTORY",
}
