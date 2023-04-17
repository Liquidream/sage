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
        // {
        //   name: "Dungeon",
        //   srcs: "sfx/dungeon.mp3",
        // },
      ],
    },
  ],
}
