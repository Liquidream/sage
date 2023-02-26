// ? = OPTIONAL (solves errors when creating objects and not specifying all props)
export interface SceneModel {
  id: string
  image?: string
  name: string
  sound?: string
  firstVisit?: boolean
  // Key-Value pair to allow properties to be set/read
  property?: { [key: string]: string | number | boolean }
  // Poss. event actions
  on_enter?: string
  on_exit?: string
  // props: Array<PropData.IPropData>
  // doors: Array<DoorData.IDoorData>
}
