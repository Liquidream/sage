export interface DoorModel {
  id: string
  name: string
  image?: string
  desc?: string
  desc_locked?: string | undefined
  target_scene_id?: string
  state?: DoorState
  key_prop_id?: string
  auto_unlock?: boolean
  x?: number
  y?: number
  width?: number
  height?: number
  // in_scene_id?: string
  location_id?: string
  visible?: boolean

  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  playSounds?: boolean
  // Poss. event actions
  on_action?: string
}

export enum DoorState {
  Unknown = "UNKNOWN",
  Locked = "LOCKED",
  Unlocked = "UNLOCKED",
}
