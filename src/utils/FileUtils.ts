import { saveAs } from "file-saver"
import JSZip from "jszip"
import { useSceneStore } from "@/stores/SceneStore"
import { Constants } from "@/constants"
import type { SagePlayData } from "@/pixi-sageplay/SagePlayData"
import { useActorStore, type ActorState } from "@/stores/ActorStore"
import { useDoorStore, type DoorState } from "@/stores/DoorStore"
import { usePropStore, type PropState } from "@/stores/PropStore"
import { useWorldStore } from "@/stores/WorldStore"
import type { SceneState } from "@/stores/SceneStore"
import type { AssetsBundle, AssetsManifest } from "pixi.js"
import { playAssets } from "@/pixi-sageplay/playAssets"
// @ts-ignore
import JSZipUtils from "jszip-utils"
import { useGameStateStore } from "@/stores/GameStateStore"
import { getActivePinia } from "pinia"
import { InkManager } from "./InkManager"
import { useSequenceStore } from "@/stores/SequenceStore"

// import * as fs from "fs"
// import * as path from "path"

export class FileUtils {
  private constructor() {
    /*this class is purely static. No constructor to see here*/
  }

  public static debugMode = true

  private static emptyPlayAssetsJSON = JSON.stringify(playAssets)

  public static initialize() {
    console.log("FileUtils:initialize()...")
  }

  /**
   * Select file(s).
   * @param {String} contentType The content type of files you wish to select. For instance, use "image/*" to select all types of images.
   * @param {Boolean} multiple Indicates if the user can select multiple files.
   * @returns {Promise<File|File[]>} A promise of a file or array of files in case the multiple parameter is true.
   */
  public static selectFile(contentType: string, multiple: boolean) {
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.multiple = multiple
      input.accept = contentType

      input.onchange = () => {
        const files = Array.from(input.files)
        if (multiple) resolve(files)
        else resolve(files[0])
      }
      input.oncancel = () => {
        resolve(null)
      }

      input.click()
    })
  }

  public static async performLoad() {
    // Import game "edit" data
    console.log("FileUtils:performLoad()...")

    // TODO: Let user upload file (or enter URL?)
    // TODO: Warn user if trying to load a version that's newer than editor (unlikely, but if not updated their copy?)
//debugger
    // const sageEditData = await response.json()
    const jsonFile = await FileUtils.selectFile(".json", false)

    // abort if cancelled
    if (jsonFile === null) {
      console.log(">>> file selection null (probably cancelled) - aborting...")
      return
    }

    // const jsonString = fs.readFileSync(sageEditData., 'utf-8');
    //const jsonString = await jsonFile.text()
    // Return a promise per file
    const filePromise = new Promise((resolve, reject) => {
      // setting up the reader
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onabort = () => resolve(reader.result)
      reader.readAsText(jsonFile, "UTF-8")
      // here we tell the reader what to do when it's done reading...
      reader.onload = async () => {
        const jsonContent = reader.result // this is the content!
        const sageEditData = JSON.parse(jsonContent)
        // Populate state
        const worldStore = useWorldStore()
        const sequenceStore = useSequenceStore()
        const propStore = usePropStore()
        const sceneStore = useSceneStore()
        const doorStore = useDoorStore()
        const actorStore = useActorStore()
        const playerStore = useGameStateStore()
        worldStore.$state = sageEditData.worldData
        sequenceStore.$state = sageEditData.sequenceData
        sceneStore.$state = sageEditData.sceneData
        propStore.$state = sageEditData.propData
        doorStore.$state = sageEditData.doorData
        actorStore.$state = sageEditData.actorData
        playerStore.$state = sageEditData.playerData

        // Hack to ensure all state is restored before
        // trying to redraw the current screen
        // else get missing objects
        // (TODO: potentially skip if no curr scene???)
        await Promise.all([
          worldStore.$persistedState.isReady(),
          sequenceStore.$persistedState.isReady(),
          sceneStore.$persistedState.isReady(),
          propStore.$persistedState.isReady(),
          doorStore.$persistedState.isReady(),
          actorStore.$persistedState.isReady(),
        ]).then(() => {
          console.log(">>>> All stores hydrated (performLoad), now initialise SceneScreen")
          //SAGEdit.currentScreen.setup()
          console.log(">>> (finished importing data)")
        })
      }
    })

    await filePromise
  }

  public static performSave() {
    console.log("FileUtils:performSave()...")

    const sageEditData = {} as any
    sageEditData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    sageEditData.id = useWorldStore().id
    sageEditData.worldData = useWorldStore().$state
    sageEditData.sequenceData = useSequenceStore().$state
    sageEditData.sceneData = useSceneStore().$state
    sageEditData.propData = usePropStore().$state
    sageEditData.doorData = useDoorStore().$state
    sageEditData.actorData = useActorStore().$state
    sageEditData.playerData = useGameStateStore().$state
    const sageEditDataJSON = JSON.stringify(sageEditData, null, 4)

    console.log("saving file...")
    const blob = new Blob([sageEditDataJSON], {
      type: "text/plain;charset=utf-8",
    })
    saveAs(blob, `${sageEditData.id}-sageData.json`)
  }

  public static async performExport() {
    console.log("FileUtils:performExport()...")

    // Create the zip file
    const zip = new JSZip()

    // Timestamp/timezone fix
    // (https://github.com/Stuk/jszip/issues/369)
    const currDate = new Date();
    const dateWithOffset = new Date(
      currDate.getTime() - currDate.getTimezoneOffset() * 60000
    )
    // replace the default date with dateWithOffset
    JSZip.defaults.date = dateWithOffset

    const assetsManifest = JSON.parse(FileUtils.emptyPlayAssetsJSON) //playAssets
    const playData = {} as SagePlayData
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = useWorldStore().id
    // World
    playData.worldData = JSON.stringify(useWorldStore().$state)

    // TODO: Specify separate Asset "Bundle" for each Sequence
    for (const sequence of useWorldStore().getSequences) {
      // Scenes
      const sceneState = FileUtils.cloneState(useSceneStore()) as SceneState
      playData.sceneData = FileUtils.exportSceneData(sceneState, assetsManifest, sequence.name, zip)
      // Props
      const propState = FileUtils.cloneState(usePropStore()) as PropState
      playData.propData = FileUtils.exportPropData(propState, assetsManifest, sequence.id, sequence.name, zip)
      // Doors
      const doorState = FileUtils.cloneState(useDoorStore()) as DoorState
      playData.doorData = FileUtils.exportDoorData(doorState, assetsManifest, sequence.id, sequence.name, zip)
      // Actors
      const actorState = FileUtils.cloneState(useActorStore()) as ActorState
      playData.actorData = FileUtils.exportActorData(actorState, assetsManifest, sequence.id, sequence.name, zip)
    }

    // Game State
    playData.gameStateData = JSON.stringify(useGameStateStore().$state)

    const playDataJSON = JSON.stringify(playData, null, 4)
    zip.file("sageData.json", playDataJSON)

    // Ink
    const inkJsonStory = InkManager.generateInkStoryJson()
    zip.file("story.json", inkJsonStory)

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
      FileUtils.urlToPromise("entry-index-play.js"),
      { binary: true }
    )

    // Folders + Files list
    // (Having to list manually, as cannot do fs.readFileSync in browser)
    const foldersAndFilesToZip = {
      images: {
        ui: [
          "inventory.png",
          "settings.png",
          "shine.png",
        ],
        "<root>": [
          "debug.png",
          "placeholder.png",
          "scene-placeholder.png",
        ],
      },
      sfx: [
        "door-locked.mp3",
        "door-unlock.mp3",
        "game-lost.mp3",
        "game-won.mp3",
        "pick-up.mp3",
      ],
      assets: [
        "browserAll-Buw1Du-H.js",
        "colorToUniform-B9L1V9HB.js",
        "getBatchSamplersUniformGroup-Cam96G_Z.js",
        "SharedSystems-_ZYLxQOU.js",
        "webfontloader-BqVzmtkE.js",
        "WebGLRenderer-BaHCsPu0.js",
        "WebGPURenderer-Ba3hV3td.js",
        "webworkerAll-B9s1-jYc.js",
      ],
    }
    FileUtils.addFolderFilesRecursively(foldersAndFilesToZip, zip)

    // Other assets
    zip.file("favicon.ico", FileUtils.urlToPromise("favicon.ico"), {
      binary: true,
    })
    zip.file("SAGE.css", FileUtils.urlToPromise("SAGE.css"), { binary: true })

    console.log("generating file...")
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      console.log("saving file...")
      saveAs(content, `${playData.id}-release.zip`)
    })
  }

  public static exportSceneData(
    sceneState: SceneState,
    assets: AssetsManifest,
    sequenceName: string,
    zip: JSZip
  ): string {
    console.log("Exporting scenes to zip...")

    const imgFolder = zip.folder("images")
    const sfxFolder = zip.folder("sfx")

    const filteredScenes = sceneState.scenes.filter(
                              (scene) => scene.name === sequenceName)

    for (const scene of filteredScenes) {
    //for (const scene of sceneState.scenes) {
      // Export image to zip & replace state data with new filename

      debugger 

      // Scene.Image
      const imgAssetName = `${scene.id}-image`
      const imgDataUri = scene.image || ""
      FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
      scene.image = imgAssetName

      // Scene.Sound 
      if (scene.sound) {
        const sfxAssetName = `${scene.id}-sound`
        const soundDataUri = scene.sound || ""
        FileUtils.exportData(sfxAssetName, soundDataUri, assets, sequenceName, sfxFolder)
        scene.sound = sfxAssetName
      }
    }

    return JSON.stringify(filteredScenes)
  }

  public static exportPropData(
    propState: PropState,
    assets: AssetsManifest,
    sequenceId: string,
    sequenceName: string,
    zip: JSZip
  ): string {
    console.log("Exporting props to zip...")

    const imgFolder = zip.folder("images")
    // const sfxFolder = zip.folder("sfx")

    const filteredProps = propState.props.filter((prop) => {
                            //debugger
                            return useSceneStore().scenes.some((s) => {
                              return prop.location_id === s.id && s.sequence_id === sequenceId
                            })
                          })

    for (const prop of filteredProps) {
    //for (const prop of propState.props) {
      // Export image to zip & replace state data with new filename

      // Prop.Image
      if (prop.image) {
        const imgAssetName = `${prop.id}-image`
        const imgDataUri = prop.image || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
        prop.image = imgAssetName
      }

      // Prop.ImageCloseup
      if (prop.image_closeup) {
        const imgAssetName = `${prop.id}-image_closeup`
        const imgDataUri = prop.image_closeup || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
        prop.image_closeup = imgAssetName
      }
    }

    return JSON.stringify(propState)
  }

  public static exportDoorData(
    doorState: DoorState,
    assets: AssetsManifest,
    sequenceId: string,
    sequenceName: string,
    zip: JSZip
  ): string {
    console.log("Exporting doors to zip...")

    const imgFolder = zip.folder("images")
    // const sfxFolder = zip.folder("sfx")

    for (const door of doorState.doors) {
      // Export image to zip & replace state data with new filename

      // Door.Image
      if (door.image) {
        const imgAssetName = `${door.id}-image`
        const imgDataUri = door.image || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
        door.image = imgAssetName
      }
    }

    return JSON.stringify(doorState)
  }

  public static exportActorData(
    actorState: ActorState,
    assets: AssetsManifest,
    sequenceId: string,
    sequenceName: string,
    zip: JSZip
  ): string {
    console.log("Exporting actors to zip...")

    const imgFolder = zip.folder("images")
    // const sfxFolder = zip.folder("sfx")

    const filteredActors = actorState.actors.filter((actor) => {
                            //debugger
                            return useSceneStore().scenes.some((s) => {
                              return actor.location_id === s.id && s.sequence_id === sequenceId
                            })
                          })

    for (const actor of filteredActors) {
    //for (const actor of actorState.actors) {
      // Export image to zip & replace state data with new filename

      // Actor.Image
      if (actor.image) {
        const imgAssetName = `${actor.id}-image`
        const imgDataUri = actor.image || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
        actor.image = imgAssetName
      }

      // Actor.ImageCloseup
      if (actor.image_closeup) {
        const imgAssetName = `${actor.id}-image_closeup`
        const imgDataUri = actor.image_closeup || ""
        FileUtils.exportData(imgAssetName, imgDataUri, assets, sequenceName, imgFolder)
        actor.image_closeup = imgAssetName
      }
    }

    return JSON.stringify(actorState)
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
    assets: AssetsManifest,
    sequenceName: string,
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

    //debugger

    // Add to assets list, within correct bundle...
    let index = assets.bundles.findIndex((item) => item.name === sequenceName)
    if (index <=0) {
      // ...(or create bundle if doesn't exist)
      index = assets.bundles.push({ name: sequenceName, assets: [] } as AssetsBundle) - 1
    }
    assets.bundles[index].assets.push({
    //assets.bundles[0].assets.push({
      alias: assetName,
      src: `${zipFolder?.root}${filename}`,
    })
  }

  public static cloneState(store: any): any {
    const stateJSON = JSON.stringify(store.$state)
    const clonedObj = JSON.parse(stateJSON)
    return clonedObj
  }

  private static addFolderFilesRecursively(foldersAndFilesToZip, zip, parentFolder) {
    let currDir = parentFolder || ""
    for (const prop in foldersAndFilesToZip) {
      //console.log(" > Key:" + prop)
      //console.log(" > Value:" + foldersAndFilesToZip[prop])
      // Is this nested?
      //console.log(" > (Type): " + typeof foldersAndFilesToZip[prop])
      if (prop.length > 1) {
        // if (parentFolder === "<root>") {
        //   currDir = `${prop}`.replace("<root>", "")
        // } else {
          currDir = `${parentFolder != null ? parentFolder + "/" : ""}${prop}`
          currDir = currDir.replace("/<root>", "")
        //}
      }
      if (typeof foldersAndFilesToZip[prop] === "object") {
        // Nested object, go a level deeper
        //console.log(" > Nested object, go a level deeper...")
        FileUtils.addFolderFilesRecursively(
          foldersAndFilesToZip[prop],
          zip,
          currDir
        )
      } else {
        // File to add to zip
        //console.log(` > Folder: ${currDir}, File: ${foldersAndFilesToZip[prop]}`)
        const filePath = `${currDir}/${foldersAndFilesToZip[prop]}`//.slice(1)
        //const filename = foldersAndFilesToZip[prop]
        //console.log(`Adding: ${filePath}`)
        zip.file(filePath, FileUtils.urlToPromise(filePath), {
          binary: true,
        })
        // File list
        //console.log(`   > File count: ${foldersAndFilesToZip[prop].length}`)
      }
    }
  }

  // private static buildZipFromDirectory(dir, zip, root) {
  //   const list = fs.readdirSync(dir)
  //   for (let file of list) {
  //     file = path.resolve(dir, file)
  //     const stat = fs.statSync(file)
  //     if (stat && stat.isDirectory()) {
  //       this.buildZipFromDirectory(file, zip, root)
  //     } else {
  //       const filedata = fs.readFileSync(file);
  //       zip.file(path.relative(root, file), filedata);
  //     }
  //   }
  // }
}
