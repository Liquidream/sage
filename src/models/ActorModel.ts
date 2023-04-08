export interface ActorModel {
  name: string
  col?: string
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  //audio ref/prefix?
}
