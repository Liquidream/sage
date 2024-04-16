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
            v-bind="validprops"
            density="comfortable"
            color="info"
            variant="tonal"
            icon
            @click="onValidateClicked"
            v-if="SAGEdit.inkCompilerLog.length > 0"
          >
          <v-badge color="error" 
           :content="SAGEdit.inkCompilerLog.length">
            <v-icon>mdi-check-all</v-icon>
          </v-badge>
        </v-btn>

        <v-btn
        @click="onValidateClicked"
            density="comfortable"
            color="info"
            variant="tonal"
            icon
            v-else
          >
            <v-icon>mdi-check-all</v-icon>
        </v-btn>
          
          <v-btn
            v-bind="props"
            density="comfortable"
            color="info"
            variant="tonal"
            icon="mdi-open-in-new"
            class="ml-3"
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
          <v-ace-editor
            :value="$props.modelValue"
            @update:value="debouncedInput($event)"
            ref="aceRefLarge"
            lang="ink"
            theme="monokai"
            class="my-editor"
            :options="{
              minLines: 5,
              maxLines: 35,
              highlightActiveLine: true,
              highlightGutterLine: true,
              highlightIndentGuides: false,
              highlightSelectedWord: true,
              printMargin: false,
              showLineNumbers: true,
              wrap: true,
            }"
          />
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="onCloseClicked">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
  <v-ace-editor
    :value="$props.modelValue"
    @update:value="debouncedInput($event)"
    ref="aceRefSmall"
    lang="ink"
    theme="monokai"
    class="my-editor"
    style="min-height: 50px"
    :options="{
      minLines: 5,
      maxLines: 10,
      showGutter: false,
      printMargin: false,
      wrap: true,
    }"
  />
</template>

<script setup lang="ts">
  import { VAceEditor } from "vue3-ace-editor"
  import "ace-builds/src-noconflict/theme-monokai"
  import "../assets/ace-ink-mode/mode-ink"
  import "../assets/ace-ink-mode/inkTheme.css"

  // Need language tools to enable core "auto-complete" func
  import ace from "ace-builds"
  import "ace-builds/src-noconflict/ext-language_tools"
  const langTools = ace.require("ace/ext/language_tools")
  
  import { inkCompleter } from "../assets/ace-ink-mode/inkCompleter"
  //const inkCompleter = require("../assets/ace-ink-mode/inkCompleter.js").inkCompleter
  //import * from "../assets/ace-ink-mode/inkCompleter"

  import { onMounted, ref, watchEffect } from "vue"
  import { useDisplay } from "vuetify"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  import { debounce } from "../utils/Debounce"

  //const model = defineModel()
  const label = defineModel("label", { required: true })

  const props = defineProps(["modelValue"])
  const emit = defineEmits(["update:modelValue"])
  const debouncedInput = debounce((e) => {emit("update:modelValue", e)}, 500)

  const dialog = ref(false)
  const { mobile } = useDisplay()

  const onPlayClicked = () => {
    // Play game
    SAGEdit.playGame()
  }

  const onCloseClicked = () => {
    // Play game
    dialog.value = false
  }

  const onValidateClicked = () => {
    // Compile/validate ink script
    SAGEdit.validateScript()
  }

  // Func to setup auto-completers
  const setupCompleters = function (editorInst) {
    //console.log(editorInst)
    // init
    editorInst.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    })

    // Exclude language_tools.textCompleter (as it autocompletes ANY existing text)
    editorInst.completers = editorInst.completers.filter(
      (completer) => completer !== langTools.textCompleter)
    
      // ..but add custom Ink completer
    editorInst.completers.push(new inkCompleter())

    // Don't re-process in future
    editorInst.initDone = true
  }

  // Get & Configure raw ace instances
  const aceRefSmall = ref(null)
  const aceRefLarge = ref(null)
  // Wait until component mounted...
  onMounted(() => {
    // ...then look for changes in the template to capture all editor refs
    watchEffect(() => {
      if (aceRefSmall.value && !aceRefSmall.value.getAceInstance().initDone) {
        //console.log("1:" + aceRefSmall.value.getAceInstance())
        setupCompleters(aceRefSmall.value.getAceInstance())
      }
      if (aceRefLarge.value && !aceRefLarge.value.getAceInstance().initDone) {
        //console.log("2:" + aceRefLarge.value.getAceInstance())
        setupCompleters(aceRefLarge.value.getAceInstance())
      }
    })
  })
</script>

<style>
  /* required class */
  .my-editor {
    background: #2d2d2d;
    color: #faf1c6;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.25;
  }
</style>
