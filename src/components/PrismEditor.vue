<template>
  <v-row align="center">
    <v-col>
      <span class="text-caption text-medium-emphasis">{{ label }}</span>
    </v-col>
    <v-col align="end">
      <v-dialog
        v-model="dialog"
        persistent
        scrollable
        :fullscreen="mobile"
        :scrim="!mobile"
        transition="dialog-bottom-transition"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            density="comfortable"
            color="info"
            variant="tonal"
            icon="mdi-open-in-new"
          >
          </v-btn>
        </template>
        <v-card>
          <v-toolbar color="rgba(0, 0, 0, 0)" theme="dark">
            <v-toolbar-title class="text-h6">{{ label }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="onPlayClicked" color="info" prepend-icon="mdi-play"
              >Play</v-btn
            >
          </v-toolbar>
          <prism-editor
            class="my-editor"
            v-model="code"
            :highlight="highlighter"
          ></prism-editor>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="onCloseClicked">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
  <prism-editor
    class="my-editor mb-3"
    style="max-height: 240px"
    :model-value="modelValue"
    @input="onCodeChange"
    :highlight="highlighter"
  >
  </prism-editor>
</template>

<script setup lang="ts">
  // import Prism Editor
  import { PrismEditor } from "vue-prism-editor"
  import "vue-prism-editor/dist/prismeditor.min.css" // import the styles somewhere

  // import highlighting library (you can use any library you want just return html string)
  import { highlight, languages } from "prismjs/components/prism-core"
  import "prismjs/components/prism-clike"
  import "prismjs/components/prism-javascript"
  import "prismjs/themes/prism-tomorrow.min.css" // import syntax highlighting styles
  import { ref, watch } from "vue"
  import { useDisplay } from "vuetify"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  const props = defineProps(["modelValue", "label"])
  //const data = reactive({ ...props })
  const emit = defineEmits(["update:modelValue"])

  // Need "code" to be reactive to get changes made in editor
  const code = ref("")
  // Also need to set to initial value (e.g. on first load)
  code.value = props.modelValue

  //--- prev failed attempts -----------------------------------
  //const inCode = toRef(props, "modelValue")

  // reactive AND synced with props.modelValue (https://stackoverflow.com/a/75298330/574415)
  //const code = toRef(props, "modelValue")

  //const code = ref(props.modelValue)
  // ------------------------------------------------------------

  // Watch prop for changes and replace code editor contents
  // This seems to cover for cases where incoming data changes (e.g. scene change)
  // (one-way update, as don't want to delay editor by always pushing down)
  // (I'm sure this could be written better to perform the same, perhaps with ":"?)
  // https://stackoverflow.com/a/72661017/574415
  watch(
    () => props.modelValue,
    (newValue, oldValue) => {
      //console.log("prop value changed", newValue)
      code.value = newValue
    }
  )

  const dialog = ref(false)
  const { mobile } = useDisplay()

  //debugger

  // Set code initially
  // (## REMOVED ##) - was causing a nesting of data, for some reason
  // code.value = data.modelValue

  // listen for code-changes to keep in sync
  // (small > large editor, and to storage)
  const onCodeChange = (event) => {
    //debugger
    //console.log("onCodeChange()")
    //code.value = event.target.value // was unnecessary, as now watching prop
    emit("update:modelValue", event.target.value)
  }

  const highlighter = (code) => {
    return highlight(code, languages.js) // languages.<insert language> to return html with markup
  }

  const onPlayClicked = () => {
    // Update state
    emit("update:modelValue", code.value)
    // Play game
    SAGEdit.playGame()
  }

  const onCloseClicked = () => {
    // Update state
    emit("update:modelValue", code.value)
    // Play game
    dialog.value = false
  }
</script>

<style>
  /* required class */
  .my-editor {
    /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
    background: #2d2d2d;
    color: #ccc;

    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
  }

  /* optional class for removing the outline */
  .prism-editor__textarea:focus {
    outline: none;
  }
</style>
