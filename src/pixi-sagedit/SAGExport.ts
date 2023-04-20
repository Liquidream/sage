import { saveAs } from "file-saver"
import JSZip from "jszip"
import { SAGEdit } from "./SAGEdit"
import { useSceneStore } from "@/stores/SceneStore"

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

    // Create the zip file
    const zip = new JSZip()
    zip.file("Hello.txt", "Hello World\n")
    const img = zip.folder("images")
    img?.file(`${sceneStore.scenes[0].id}.jpg`, imgData, { base64: true })
    zip.generateAsync({ type: "blob" }).then(function (content) {
      // see FileSaver.js
      saveAs(content, "example.zip")
    })
  }
}
