<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <input
    type="file"
    @change="onImageFileChange"
    accept="image/png, image/jpeg, image/bmp, video/*"
    id="uploader"
    class="d-none"
  />
  <v-img
    v-if="isImage"
    :src="value"
    max-height="50"
    :aspect-ratio="16 / 9"
    cover
    hide-details
    @click="changeImage"
    align="center"
  >
    <v-btn
      class="mt-2 elevation-2"
      icon="mdi-camera"
      variant="outlined"
      size="x-small"
    ></v-btn>
  </v-img>

  <v-img
    v-else-if="isVideo"
    :src="thumbnail"
    max-height="50"
    :aspect-ratio="16 / 9"
    cover
    hide-details
    @click="changeImage"
    align="center"
  >
    <v-btn
      class="mt-2 elevation-2"
      icon="mdi-camera"
      variant="outlined"
      size="x-small"
    ></v-btn>
  </v-img>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue"

  const props = defineProps(["modelValue", "label", "thumbnail"])
  const emit = defineEmits(["update:modelValue", "update:thumbnail"])
  const value = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit("update:modelValue", value)
    },
  })

  const thumbnail = computed({
    get() {
      return props.thumbnail
    },
    set(value) {
      emit("update:thumbnail", value)
    },
  })

  const isImage = computed(() => {
    return props.modelValue?.includes("image")
  })

  const isVideo = computed(() => {
    return props.modelValue?.includes("video")
  })

  //let chosenFile: any
  const imageData: Ref<string | ArrayBuffer | null> = ref("")

  const changeImage = () => {
    document.getElementById("uploader")?.click()
  }

  const onImageFileChange = (e: any) => {
    const dataUrlReader = new FileReader()
    const thumbReader = new FileReader()
    const file = e.target.files[0]
    dataUrlReader.readAsDataURL(e.target.files[0])
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    //if (file.type.match("image")) {
    dataUrlReader.onload = () => {
      // debugger
      imageData.value = dataUrlReader.result
      value.value = dataUrlReader.result as string // added "as" to squash error/warn, ok?
    }
    if (!file.type.match("image")) {
      thumbReader.onload = () => {
        // debugger
        const blob = new Blob([thumbReader.result], { type: file.type })
        const url = URL.createObjectURL(blob)
        const video = document.createElement("video")
        const timeupdate = function () {
          if (snapImage()) {
            video.removeEventListener("timeupdate", timeupdate)
            video.pause()
          }
        }
        video.addEventListener("loadeddata", function () {
          if (snapImage()) {
            video.removeEventListener("timeupdate", timeupdate)
          }
        })
        const snapImage = function () {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth / 8 // Lower resolution
          canvas.height = video.videoHeight / 8 //
          canvas
            .getContext("2d")
            .drawImage(video, 0, 0, canvas.width, canvas.height)
          const image = canvas.toDataURL()
          //console.log(image)
          const success = image.length > 1000
          if (success) {
            // store thumbnail
            thumbnail.value = image
            //   const img = document.createElement("img")
            //   img.src = image
            //   document.getElementsByTagName("div")[0].appendChild(img)
            //   URL.revokeObjectURL(url)
          }
          return success
        }
        video.addEventListener("timeupdate", timeupdate)
        video.preload = "metadata"
        video.src = url
        // Load video in Safari / IE11
        video.muted = true
        video.playsInline = true
        video.play()
      }
      thumbReader.readAsArrayBuffer(file)
    }
  }
</script>
