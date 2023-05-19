export interface ActorModel {
  id: string //also used for audio ref/prefix?
  name: string
  col?: string
  desc?: string // Poss having diff desc's for each state?
  location_id?: string
  image?: string // Poss multiple, for each state?
  state?: string // e.g. "happy", "dead", etc.
  scene_x?: number
  scene_y?: number
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_interact?: string
}
