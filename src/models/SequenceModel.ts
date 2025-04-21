// ? = OPTIONAL (solves errors when creating objects and not specifying all props)
export interface SequenceModel {
  id: string
  name: string
  colour?: string
  // image?: string
  // thumbnail?: string
  //sound?: string
  //firstVisit?: boolean
  // Key-Value pair to allow properties to be set/read
  //property?: { [key: string]: string | number | boolean }
  // ink scripting
  // script?: string
  // // Poss. event actions
  // on_enter?: string
  // on_exit?: string
}
