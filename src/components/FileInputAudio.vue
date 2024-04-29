<template>
  <v-file-input
    class="mt-8"
    @change="onSoundFileChange"
    :label="filename ?? label"
    accept="audio/mpeg, audio/ogg, audio/vnd.wav"
    placeholder="Pick a backdrop sound"
    prepend-icon="mdi-volume-high"
    clearable
    @click:clear="onClear"
    title=""
    single-line
  >
    <template v-slot:append>
      <v-btn
        density="comfortable"
        variant="tonal"
        icon="mdi-play"
        @click="playAudio"
      ></v-btn>
    </template>
  </v-file-input>
</template>

<script setup lang="ts">
  import { computed, ref, type Ref } from "vue"

  const model = defineModel()
  const props = defineProps(["label"])

  const filename = computed(() => {
    try {
      if (model.value) {
        const fileInfoArray = model.value.split("|")
        if (fileInfoArray.length == 2) {
          return fileInfoArray[0]
        }
      }
    } catch {
      //ignore all
    }
    return null
  })
  const soundData: Ref<string | ArrayBuffer | null> = ref("")
  let audio = new Audio()

  const playAudio = (e: any) => {
    // Bail out if nothing to play
    if (model.value == null) return
    // Get just base64 section
    const audioData = model.value.split("|")[1]
    audio = new Audio()
    audio.src = audioData
    audio.play()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSoundFileChange = (e: any) => {
    const reader = new FileReader()
    const filename = e.target.files[0].name
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      // debugger
      soundData.value = reader.result
      model.value = `${filename}|${reader.result}`
      //model.value = reader.result as string // added "as" to squash error/warn, ok?
    }
  }

  const onClear = () => {
    model.value = null
    parent?.focus()
  }
</script>
