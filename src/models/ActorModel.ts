export interface ActorModel {
  id: string
  name: string
  col?: string
  desc?: string
  isPlayer: boolean
  location_id?: string
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  //audio ref/prefix?
}