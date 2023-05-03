// Mostly a way to encapsulate handling getting details of file
// whether it's the first time or whether it's been pulled from cache

// import type { BaseTexture } from "pixi.js"

// export class FileUtils {
//   private constructor() {
//     /*this class is purely static. No constructor to see here*/
//   }

//   public static onTextureChange(e: any): BaseTexture {
//     const reader = new FileReader()
//     // Use the javascript reader object to load the contents
//     // of the file in the v-model prop
//     reader.readAsDataURL(e.target.files[0])
//     reader.onload = () => {
//       imageData.value = reader.result
//       if (model.value) {
//         model.value.image = reader.result as string // added "as" to squash error/warn, ok?
//         // Now do a test load into Pixi texture to get dimensions
//         const base = new BaseTexture(model.value.image)
//         // If previously cached texture, get dimensions immediately
//         if (base.valid) {
//           model.value.width = base.width
//           model.value.height = base.height
//         } else {
//           // ...else grab dimensions one texture fully loaded
//           base.on("loaded", () => {
//             if (model.value) {
//               model.value.width = base.width
//               model.value.height = base.height
//             }
//           })
//         }
//       }
//     }
//   }

// }
