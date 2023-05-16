import { saveAs } from "file-saver"
import JSZip from "jszip"
import { useSceneStore } from "@/stores/SceneStore"
import { Constants } from "@/constants"
import type { SagePlayData } from "@/pixi-sageplay/SagePlayData"
import { useActorStore } from "@/stores/ActorStore"
import { useDoorStore, type DoorState } from "@/stores/DoorStore"
import { usePropStore, type PropState } from "@/stores/PropStore"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneState } from "@/stores/SceneStore"
import type { ResolverManifest } from "pixi.js"
import { playAssets } from "@/pixi-sageplay/playAssets"
// @ts-ignore
import JSZipUtils from "jszip-utils"
import { usePlayerStore } from "@/stores/PlayerStore"
import { getActivePinia } from "pinia"

export class FileUtils {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true

  public static initialize() {
    console.log("SAGExport:initialize()...")
  }

  public static async performLoad() {
    console.log("SAGExport:performLoad()...")
  }

  public static performSave() {
    console.log("SAGExport:performSave()...")

    const playData = {}
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = useWorldStore().id
    playData.worldData = useWorldStore().$state
    playData.sceneData = useSceneStore().$state
    playData.propData = usePropStore().$state
    playData.doorData = useDoorStore().$state
    playData.actorData = useActorStore().$state
    playData.playerData = usePlayerStore().$state
    const playDataJSON = JSON.stringify(playData, null, 2)

    // const playData = {} as SagePlayData
    // playData.version = Constants.APP_VERSION
    // // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    // playData.id = useWorldStore().id
    // playData.worldData = JSON.stringify(useWorldStore().$state)
    // playData.sceneData = JSON.stringify(useSceneStore().$state)
    // playData.propData = JSON.stringify(usePropStore().$state)
    // playData.doorData = JSON.stringify(useDoorStore().$state)
    // playData.actorData = JSON.stringify(useActorStore().$state)
    // playData.playerData = JSON.stringify(usePlayerStore().$state)
    // const playDataJSON = JSON.stringify(playData, null, 2)

    console.log("saving file...")
    const blob = new Blob([playDataJSON], { type: "text/plain;charset=utf-8" })
    saveAs(blob, `${playData.id}-sageData.json`)
  }

  public static async performExport() {
    console.log("SAGExport:performExport()...")

    // Create the zip file
    const zip = new JSZip()
    const assetsManifest = playAssets
    const playData = {} as SagePlayData
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = useWorldStore().id
    // World
    playData.worldData = JSON.stringify(useWorldStore().$state)
    // Scenes
    const sceneState = FileUtils.cloneState(useSceneStore()) as SceneState
    playData.sceneData = FileUtils.exportSceneData(
      sceneState,
      assetsManifest,
      zip
    )
    // Props
    const propState = FileUtils.cloneState(usePropStore()) as PropState
    playData.propData = FileUtils.exportPropData(propState, assetsManifest, zip)
    // Doors
    const doorState = FileUtils.cloneState(useDoorStore()) as DoorState
    playData.doorData = FileUtils.exportDoorData(doorState, assetsManifest, zip)
    playData.actorData = JSON.stringify(useActorStore().$state)
    playData.playerData = JSON.stringify(usePlayerStore().$state)

    const playDataJSON = JSON.stringify(playData, null, 2)
    zip.file("sageData.json", playDataJSON)

    // debugger

    const assetsJSON = JSON.stringify(assetsManifest, null, 2)
    zip.file("assets.json", assetsJSON)

    // Core runtime files
    //debugger
    let htmlPage = await fetch("index-play.html").then((response) =>
      // When the page is loaded convert it to text
      response.text()
    )
    htmlPage = htmlPage.replace("{{title}}", useWorldStore().title)
    htmlPage = htmlPage.replace("{{dataId}}", playData.id)
    zip.file("index.html", htmlPage)
    zip.file(
      "entry-index-play.js",
      FileUtils.urlToPromise("entry-index_play.js"),
      { binary: true }
    )

    // Code GFX files
    zip
      .folder("images")
      .file("debug.png", FileUtils.urlToPromise("images/debug.png"), {
        binary: true,
      })
    zip
      .folder("images")
      .folder("ui")
      .file("shine.png", FileUtils.urlToPromise("images/ui/shine.png"), {
        binary: true,
      })
    zip
      .folder("images")
      .folder("ui")
      .file("settings.png", FileUtils.urlToPromise("images/ui/settings.png"), {
        binary: true,
      })
    zip
      .folder("images")
      .folder("ui")
      .file(
        "inventory.png",
        FileUtils.urlToPromise("images/ui/inventory.png"),
        { binary: true }
      )

    // Code SFX files
    zip
      .folder("sfx")
      .file("pick-up.mp3", FileUtils.urlToPromise("sfx/pick-up.mp3"), {
        binary: true,
      })
    zip
      .folder("sfx")
      .file("door-locked.mp3", FileUtils.urlToPromise("sfx/door-locked.mp3"), {
        binary: true,
      })
    zip
      .folder("sfx")
      .file("door-unlock.mp3", FileUtils.urlToPromise("sfx/door-unlock.mp3"), {
        binary: true,
      })
    zip
      .folder("sfx")
      .file("game-won.mp3", FileUtils.urlToPromise("sfx/game-won.mp3"), {
        binary: true,
      })
    zip
      .folder("sfx")
      .file("game-lost.mp3", FileUtils.urlToPromise("sfx/game-lost.mp3"), {
        binary: true,
      })

    // Other assets
    zip.file("favicon.ico", FileUtils.urlToPromise("favicon.ico"), {
      binary: true,
    })
    //zip.file("SAGE.css", SAGExport.urlToPromise("SAGE.css"), { binary: true })
    zip
      .folder("assets")
      .file(
        "webfontloader.js",
        FileUtils.urlToPromise("assets/webfontloader.js"),
        { binary: true }
      )

    console.log("generating file...")
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      console.log("saving file...")
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
      FileUtils.exportData(imgAssetName, imgDataUri, assets, imgFolder)
      scene.image = imgAssetName

      // Scene.Sound
      if (scene.sound) {
        const sfxAssetName = `${scene.id}-sound`
        const soundDataUri = scene.sound || ""
        FileUtils.exportData(sfxAssetName, soundDataUri, assets, sfxFolder)
        scene.sound = sfxAssetName
      }
    }

    return JSON.stringify(sceneState)
  }

  public static exportPropData(
    propState: PropState,
    assets: ResolverManifest,
    zip: JSZip
  ): string {
    console.log("Exporting props to zip...")

    const imgFolder = zip.folder("images")
    // const sfxFolder = zip.folder("sfx")

    for (const prop of propState.props) {
      // Export image to zip & replace state data with new filename

      // Prop.Image
      if (prop.image) {
        const imgAssetName = `${prop.id}-image`
        const imgDataUri = prop.image || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, imgFolder)
        prop.image = imgAssetName
      }
    }

    return JSON.stringify(propState)
  }

  public static exportDoorData(
    propState: DoorState,
    assets: ResolverManifest,
    zip: JSZip
  ): string {
    console.log("Exporting doors to zip...")

    const imgFolder = zip.folder("images")
    // const sfxFolder = zip.folder("sfx")

    for (const door of propState.doors) {
      // Export image to zip & replace state data with new filename

      // Door.Image
      if (door.image) {
        const imgAssetName = `${door.id}-image`
        const imgDataUri = door.image || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, imgFolder)
        door.image = imgAssetName
      }
    }

    return JSON.stringify(propState)
  }

  public static urlToPromise(url: string) {
    return new Promise((resolve, reject) => {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

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
    const fileExt = dataUri.split(";")[0].split("/")[1]
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
