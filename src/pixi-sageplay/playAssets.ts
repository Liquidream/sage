import type { ResolverManifest } from "pixi.js"

export const playAssets: ResolverManifest = {
  bundles: [
    {
      name: "load-screen",
      assets: [
        {
          name: "DebugFill",
          srcs: "images/debug.png",
        },
        {
          name: "UI-Shine",
          srcs: "images/ui/shine.png",
        },
        {
          name: "UI-Settings",
          srcs: "images/ui/settings.png",
        },
        {
          name: "UI-Inventory",
          srcs: "images/ui/inventory.png",
        },
        {
          name: "SFX-PickUp",
          srcs: "sfx/pick-up.mp3",
        },

      ],
    },
  ],
}
