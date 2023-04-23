import { saveAs } from "file-saver"
import JSZip from "jszip"
import { SAGEdit } from "./SAGEdit"
import { useSceneStore } from "@/stores/SceneStore"
import { Constants } from "@/constants"
import type { SagePlayData } from "@/pixi-sageplay/SagePlayData"
import { useActorStore } from "@/stores/ActorStore"
import { useDoorStore } from "@/stores/DoorStore"
import { usePropStore } from "@/stores/PropStore"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneState } from "@/stores/SceneStore"
import type { ResolverManifest } from "pixi.js"

export class SAGExport {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true

  public static initialize() {
    console.log("SAGExport:initialize()...")
  }

  public static performExport() {
    console.log("SAGExport:performExport()...")

    // Create the zip file
    const zip = new JSZip()

    const assetsManifest: ResolverManifest = {}

    const playData = {} as SagePlayData
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = "kingsRansom"
    // World
    playData.worldData = JSON.stringify(useWorldStore().$state)
    // Scenes
    const sceneState = SAGExport.cloneState(useSceneStore()) as SceneState
    debugger
    playData.sceneData = SAGExport.exportSceneData(
      sceneState,
      assetsManifest,
      zip
    )
    // playData.sceneData = JSON.stringify(useSceneStore().$state)
    playData.propData = JSON.stringify(usePropStore().$state)
    playData.doorData = JSON.stringify(useDoorStore().$state)
    playData.actorData = JSON.stringify(useActorStore().$state)
    const playDataJSON = JSON.stringify(playData, null, 2)

    // Create the zip file
    // const zip = new JSZip()
    // zip.file("Hello.txt", "Hello World\n")
    // const img = zip.folder("images")
    // img?.file(`${sceneStore.scenes[0].id}.jpg`, imgData, { base64: true })

    zip.file("sageData.json", playDataJSON)

    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, "example.zip")
    })
  }

  public static exportSceneData(
    sceneState: SceneState,
    assets: ResolverManifest,
    zip: JSZip
  ): string {
    console.log("Exporting scenes to zip...")

    const imgFolder = zip.folder("images")

    for (const scene of sceneState.scenes) {
      // Export image to zip & replace state data with new filename
      const imgAssetName = `${scene.id}-image`
      const imgDataUri = scene.image || ""
      SAGExport.exportImage(imgAssetName, imgDataUri, assets, imgFolder)
      scene.image = imgAssetName

      const sfxFolder = zip.folder("sfx")

      // Export image to zip & replace state data with new filename
      const sfxAssetName = `${scene.id}-sound`
      const soundDataUri = scene.sound || ""
      SAGExport.exportSound(sfxAssetName, soundDataUri, assets, sfxFolder)
      scene.sound = sfxAssetName
    }

    return JSON.stringify(sceneState)
  }

  public static exportSound(
    assetName: string,
    soundDataUri: string,
    assets: ResolverManifest,
    zipImageFolder: JSZip | null
  ): string {
    const idx = soundDataUri.indexOf("base64,") + "base64,".length
    const soundData = soundDataUri.substring(idx)
    // TODO: Need to preserve original extensions
    zipImageFolder?.file(`${assetName}.mp3`, soundData, { base64: true })
    return assetName
  }

  public static exportImage(
    assetName: string,
    imgDataUri: string,
    assets: ResolverManifest,
    zipImageFolder: JSZip | null
  ) {
    // Find the offset to start of data
    // https://github.com/Stuk/jszip/issues/404
    const idx = imgDataUri.indexOf("base64,") + "base64,".length
    const imgData = imgDataUri.substring(idx)
    // TODO: Need to preserve original extensions
    zipImageFolder?.file(`${assetName}.jpg`, imgData, { base64: true })
    // TODO: Need to also return filetype (maybe do both here, then parse)
  }

  public static cloneState(store: any): any {
    const stateJSON = JSON.stringify(store.$state)
    const clonedObj = JSON.parse(stateJSON)
    return clonedObj
  }
}
