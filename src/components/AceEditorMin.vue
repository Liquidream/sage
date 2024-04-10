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
          <v-ace-editor
            v-model:value="model"
            lang="ink"
            theme="monokai"
            :options="{
              minLines: 3,
              maxLines: 15,
              showGutter: false,
              highlightActiveLine: false,
              highlightGutterLine: false,
              highlightIndentGuides: false,
              highlightSelectedWord: false,
              wrap: true,
            }"
          />
          <!-- <prism-editor
            class="my-editor"
            v-model="code"
            :highlight="highlighter"
          ></prism-editor> -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="onCloseClicked">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
  dsfsdf
  <v-ace-editor
    v-model:value="model"
    lang="ink"
    theme="monokai"
    :options="{
      minLines: 10,
      maxPixelHeight: 240,
      showGutter: false,
      highlightActiveLine: false,
      highlightGutterLine: false,
      highlightIndentGuides: false,
      highlightSelectedWord: false,
      wrap: true,
    }"
  />
  khkjhkjhikjhkjh
  <!-- <prism-editor
    class="my-editor mb-3"
    style="max-height: 240px"
    :model-value="modelValue"
    @input="onCodeChange"
    :highlight="highlighter"
  > 
  </prism-editor>
  -->
</template>

<script setup lang="ts">
  import { VAceEditor } from "vue3-ace-editor"
  import "../assets/acesrc/mode-ink"
  import "../assets/acesrc/theme-monokai"
  import "../assets/acesrc/inkTheme.css"

  import { ref, watch } from "vue"
  import { useDisplay } from "vuetify"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  const model = defineModel()
  const label = defineModel('label', { required: true })

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

  /* optional class for removing the outline 
    (from PrismEditor - still useful???)*/
  /* .prism-editor__textarea:focus {
    outline: none;
  } */
</style>
