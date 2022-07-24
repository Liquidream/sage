// global.d.ts

// -------------------------------------------------------
// Add support for fullscreen API's

interface HTMLElement {
  // Full screen entry
  webkitRequestFullscreen(options?: FullscreenOptions): Promise<void>
  webkitRequestFullScreen(options?: FullscreenOptions): Promise<void>
  msRequestFullscreen(options?: FullscreenOptions): Promise<void>
  mozRequestFullScreen(options?: FullscreenOptions): Promise<void>

  // Monitor full screen
  onwebkitfullscreenchange: ((this: Element, ev: Event) => unknown) | null
  onmozfullscreenchange: ((this: Element, ev: Event) => unknown) | null
  MSFullscreenChange: ((this: Element, ev: Event) => unknown) | null
}

interface Document {
  // Elements of the current full screen
  readonly webkitFullscreenElement: Element | null
  readonly msFullscreenElement: Element | null
  readonly mozFullScreenElement: Element | null

  // Exit full screen
  webkitExitFullscreen(): Promise<void>
  msExitFullscreen(): Promise<void>
  mozCancelFullScreen(): Promise<void>
}
