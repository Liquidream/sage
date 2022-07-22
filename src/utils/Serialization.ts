export interface Serialization<T> {
  // Populate self from a deserialised JSON Object
  fromJSON(input: any): T

  // This is actually the built-in function that JSON.stringify will use.
  // So, this allows clases to override this (e.g. to hide props)
  toJSON(): any
}

export function replacer() {
  const objects: any[] = []

  return function (key: string, value: any) {
    if (typeof value === "object" && value !== null) {
      const found = objects.some(function (existing) {
        return existing === value
      })

      if (found) {
        return "[Circular: " + key + "]"
      }

      objects.push(value)
    }

    return value
  }
}
