<template>

  <!-- Compile/other error notifications -->
  <template>
    <v-bottom-sheet v-model="errorDialog">
      <!-- <template v-slot:activator="{ props }">
        <div class="text-center">
          <v-btn
            v-bind="props"
            color="purple"
            size="x-large"
            text="Click Me"
          ></v-btn>
        </div>
      </template> -->

      <v-list>
        <v-list-subheader>Compiler errors</v-list-subheader>

        <v-list-item
          v-for="log in compilerResult.log"
          :key="log.message"
          :prepend-icon="
            log.type === ErrorTypeCustom.Warning
              ? 'mdi-alert'
              : log.type === ErrorTypeCustom.Error
              ? 'mdi-close-circle'
              : 'mdi-checkbox-outline'
          "
          :title="log.message"
          @click="errorDialog = false"
        ></v-list-item>
      </v-list>
    </v-bottom-sheet>
  </template>

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
            density="comfortable"
            color="info"
            variant="tonal"
            icon
            @click="onValidateClicked"
            v-if="compilerResult.log.length > 0"
          >
            <v-badge color="error" :content="compilerResult.log.length">
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
            <v-btn
              density="comfortable"
              color="info"
              variant="tonal"
              icon
              @click="onValidateClicked"
              v-if="compilerResult.log.length > 0"
            >
              <v-badge color="error" :content="compilerResult.log.length">
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
              firstLineNumber:scriptStartLineNumber,
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

  //import modeInkUrl from "../assets/ace-ink-mode/mode-ink?url" // fails due to "exports" - so dummy URL just to stop runtime warning
  ace.config.setModuleUrl("ace/mode/ink", "")
  // import themeMonokaiUrl from "ace-builds/src-noconflict/theme-monokai?url"
  // ace.config.setModuleUrl("ace/theme/monokai", themeMonokaiUrl)

  import "ace-builds/src-noconflict/ext-language_tools"
  const langTools = ace.require("ace/ext/language_tools")

  import { inkCompleter } from "../assets/ace-ink-mode/inkCompleter"

  import { computed, onMounted, reactive, ref, watchEffect } from "vue"
  import { useDisplay } from "vuetify"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  import { debounce } from "../utils/Debounce"
  import { InkManager, ErrorTypeCustom } from "@/utils/InkManager"

  //const model = defineModel()
  const label = defineModel("label", { required: true })
  const objType = defineModel("type", { required: true })

  const props = defineProps(["modelValue"])
  const emit = defineEmits(["update:modelValue"])
  const debouncedInput = debounce((e) => {
    emit("update:modelValue", e)
    // validate on update
    // TODO: would be better for validation to be on a longer delay?
    compilerResult.log = InkManager.validateScript()
  }, 500)

  const dialog = ref(false)
  const errorDialog = ref(false)
  const { mobile } = useDisplay()

  const onPlayClicked = () => {
    // Play game
    SAGEdit.playGame()
  }

  const onCloseClicked = () => {
    // Play game
    dialog.value = false
  }

  // a computed ref
  const scriptStartLineNumber = computed((): number => {
    //debugger
    switch (objType.value) {
      case "scene": {
        return InkManager.inkHeaderScene.split(/\r\n|\r|\n/).length + 1
      }
      case "actor": {
        return InkManager.inkHeaderActor.split(/\r\n|\r|\n/).length + 1
      }
      case "prop": {
        return InkManager.inkHeaderProp.split(/\r\n|\r|\n/).length + 1
      }
      case "door": {
        return InkManager.inkHeaderDoor.split(/\r\n|\r|\n/).length + 1
      }
      default: {
        return 0
      }
    }
  })

  const compilerResult = reactive({
    log: [] as LogEntry[],
  })
  const onValidateClicked = () => {
    // Compile/validate ink script
    if (compilerResult.log.length > 0) {
      errorDialog.value = true
    }
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

    // validate on startup
    // (Do it on a delay, to give storage chance to hydrate - if first load)
    setTimeout(() => (compilerResult.log = InkManager.validateScript()), 1000)
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
