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

    // Get an image
    const sceneStore = useSceneStore()
    const imgDataUri = sceneStore.scenes[0].image || ""
    // Find the offset to start of data
    // https://github.com/Stuk/jszip/issues/404
    const idx = imgDataUri.indexOf("base64,") + "base64,".length
    const imgData = imgDataUri.substring(idx)

    const playData = {} as SagePlayData
    playData.version = Constants.APP_VERSION
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = "kingsRansom"
    playData.worldData = JSON.stringify(useWorldStore().$state)
    playData.sceneData = JSON.stringify(useSceneStore().$state)
    playData.propData = JSON.stringify(usePropStore().$state)
    playData.doorData = JSON.stringify(useDoorStore().$state)
    playData.actorData = JSON.stringify(useActorStore().$state)
    const playDataJSON = JSON.stringify(playData, null, 2)

    // Create the zip file
    const zip = new JSZip()
    zip.file("Hello.txt", "Hello World\n")
    const img = zip.folder("images")
    img?.file(`${sceneStore.scenes[0].id}.jpg`, imgData, { base64: true })

    zip.file("sageData.json", playDataJSON)

    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, "example.zip")
    })
  }
}
