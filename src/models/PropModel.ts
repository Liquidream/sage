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
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_action?: string
  on_use?: string
}
