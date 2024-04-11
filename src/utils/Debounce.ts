// From:
// https://stackoverflow.com/a/76130570/574415

export function debounce(func: Function, timeout: number) {
  let timeoutId: number
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, timeout)
  }
}
