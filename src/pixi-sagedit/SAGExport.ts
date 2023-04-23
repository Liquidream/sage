import { saveAs } from "file-saver"
import JSZip from "jszip"
import { useSceneStore } from "@/stores/SceneStore"
import { Constants } from "@/constants"
import type { SagePlayData } from "@/pixi-sageplay/SagePlayData"
import { useActorStore } from "@/stores/ActorStore"
import { useDoorStore } from "@/stores/DoorStore"
import { usePropStore } from "@/stores/PropStore"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneState } from "@/stores/SceneStore"
import type { ResolverManifest } from "pixi.js"
import { playAssets } from "@/pixi-sageplay/playAssets"

export class SAGExport {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true

  public static initialize() {
    console.log("SAGExport:initialize()...")
  }

  public static async performExport() {
    console.log("SAGExport:performExport()...")

    // Create the zip file
    const zip = new JSZip()

    const assetsManifest = playAssets

    const playData = {} as SagePlayData
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = "kingsRansom"
    // World
    playData.worldData = JSON.stringify(useWorldStore().$state)
    // Scenes
    const sceneState = SAGExport.cloneState(useSceneStore()) as SceneState
    playData.sceneData = SAGExport.exportSceneData(sceneState, assetsManifest, zip)
    // playData.sceneData = JSON.stringify(useSceneStore().$state)
    playData.propData = JSON.stringify(usePropStore().$state)
    playData.doorData = JSON.stringify(useDoorStore().$state)
    playData.actorData = JSON.stringify(useActorStore().$state)

    const playDataJSON = JSON.stringify(playData, null, 2)
    zip.file("sageData.json", playDataJSON)

    const assetsJSON = JSON.stringify(assetsManifest, null, 2)
    zip.file("assets.json", assetsJSON)

    // Core runtime files
    fetch("/" + "index.html")
      .then((res) => res.arrayBuffer())
      .then((ab) => {
        zip.file("index.html", ab)
      })
    fetch("/" + "entry-index.js")
      .then((res) => res.arrayBuffer())
      .then((ab) => {
        zip.file("entry-index.js", ab)
      })

    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, `${playData.id}-release.zip`)
    })
  }

  public static exportSceneData(
    sceneState: SceneState,
    assets: ResolverManifest,
    zip: JSZip
  ): string {
    console.log("Exporting scenes to zip...")

    const imgFolder = zip.folder("images")
    const sfxFolder = zip.folder("sfx")

    for (const scene of sceneState.scenes) {
      // Export image to zip & replace state data with new filename

      // Scene.Image
      const imgAssetName = `${scene.id}-image`
      const imgDataUri = scene.image || ""
      SAGExport.exportData(imgAssetName, imgDataUri, assets, imgFolder)
      scene.image = imgAssetName

      // Scene.Sound
      const sfxAssetName = `${scene.id}-sound`
      const soundDataUri = scene.sound || ""
      SAGExport.exportData(sfxAssetName, soundDataUri, assets, sfxFolder)
      scene.sound = sfxAssetName
    }

    return JSON.stringify(sceneState)
  }

  // public static exportSound(
  //   assetName: string,
  //   soundDataUri: string,
  //   assets: ResolverManifest,
  //   zipImageFolder: JSZip | null
  // ) {
  //   const idx = soundDataUri.indexOf("base64,") + "base64,".length
  //   const soundData = soundDataUri.substring(idx)
  //   const fileExt = soundDataUri.split(';')[0].split('/')[1]
  //   const filename = `${assetName}.${fileExt}`
  //   // TODO: Need to preserve original extensions
  //   zipImageFolder?.file(`${filename}`, soundData, { base64: true })

  //   // Add to assets list
  //   assets.bundles[0].assets.push({
  //     name: assetName,
  //     srcs: `${zipImageFolder?.root}${filename}`,
  //   })
  // }

  // public static exportImage(
  //   assetName: string,
  //   imgDataUri: string,
  //   assets: ResolverManifest,
  //   zipImageFolder: JSZip | null
  // ) {
  //   // Find the offset to start of data
  //   // https://github.com/Stuk/jszip/issues/404
  //   const idx = imgDataUri.indexOf("base64,") + "base64,".length
  //   const imgData = imgDataUri.substring(idx)
  //   const fileExt = soundDataUri.split(';')[0].split('/')[1]
  //   const filename = `${assetName}.${fileExt}`
  //   // TODO: Need to preserve original extensions
  //   zipImageFolder?.file(`${assetName}.jpg`, imgData, { base64: true })

  //   // Add to assets list
  //   assets.bundles[0].assets.push({
  //     name: assetName,
  //     srcs: `${zipImageFolder?.root}${assetName}.jpg`,
  //   })

  //   // TODO: Need to also return filetype (maybe do both here, then parse)
  // }

  public static exportData(
    assetName: string,
    dataUri: string,
    assets: ResolverManifest,
    zipFolder: JSZip | null
  ) {
    // Find the offset to start of data
    // https://github.com/Stuk/jszip/issues/404
    const idx = dataUri.indexOf("base64,") + "base64,".length
    const data = dataUri.substring(idx)
    const fileExt = dataUri.split(';')[0].split('/')[1]
    const filename = `${assetName}.${fileExt}`
    // TODO: Need to preserve original extensions
    zipFolder?.file(filename, data, { base64: true })

    // Add to assets list
    assets.bundles[0].assets.push({
      name: assetName,
      srcs: `${zipFolder?.root}${filename}`,
    })
  }

  public static cloneState(store: any): any {
    const stateJSON = JSON.stringify(store.$state)
    const clonedObj = JSON.parse(stateJSON)
    return clonedObj
  }
}
