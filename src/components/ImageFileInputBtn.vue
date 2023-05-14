<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-file-input
    v-model="chosenFile"
    type="file"
    @change="onImageFileChange"
    accept="image/png, image/jpeg, image/bmp, video/*"
    placeholder="Pick a backdrop image"
    id="uploader"
    class="d-none"
  ></v-file-input>
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

  <div v-else-if="isVideo" class="video" style="position: relative" @click="changeImage">
    <video height="50" preload="metadata" style="display: block;">
      <source :src="value" type="video/mp4" />
    </video>
    <v-btn
      class="mb-2 ml-7 elevation-2"
      icon="mdi-video"
      variant="outlined"
      size="x-small"
      style="position: absolute; bottom: 0; z-index: 1; text-align: center"
    ></v-btn>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue"

  const props = defineProps(["modelValue", "label"])
  const emit = defineEmits(["update:modelValue"])
  const value = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit("update:modelValue", value)
    },
  })

  const isImage = computed(() => {
    return props.modelValue.includes("image")
  })

  const isVideo = computed(() => {
    return props.modelValue.includes("video")
  })

  let chosenFile: any
  const imageData: Ref<string | ArrayBuffer | null> = ref("")

  const changeImage = () => {
    document.getElementById("uploader")?.click()
  }
  const onImageFileChange = (e: any) => {
    const reader = new FileReader()
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      // debugger
      imageData.value = reader.result
      value.value = reader.result as string // added "as" to squash error/warn, ok?
      //model.value.image = reader.result as string // added "as" to squash error/warn, ok?
    }
  }
</script>
