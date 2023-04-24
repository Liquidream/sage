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
        {
          name: "SFX-DoorLocked",
          srcs: "sfx/door-locked.mp3",
        },
        {
          name: "SFX-DoorUnlock",
          srcs: "sfx/door-unlock.mp3",
        },
        {
          name: "SFX-GameWon",
          srcs: "sfx/game-won.mp3",
        },
        {
          name: "SFX-GameLost",
          srcs: "sfx/game-lost.mp3",
        },
      ],
    },
  ],
}