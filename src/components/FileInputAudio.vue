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
    <!-- <template v-if="filename" #prepend-inner>
      {{ filename }}
    </template> -->
  </v-file-input>
</template>

<script setup lang="ts">
  import { computed, ref, type Ref } from "vue"

  const model = defineModel()
  const props = defineProps(["label"])

  const filename = computed(() => {
    try {
      const fileInfoArray = model.value.split("|")
      if (fileInfoArray.length == 2) {
        return fileInfoArray[0]
      }
    } catch {
      //ignore all
    }
    return null
  })
  const soundData: Ref<string | ArrayBuffer | null> = ref("")

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
  }
</script>
