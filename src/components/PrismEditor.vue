<template>
  <v-row align="center">
    <v-col>
      <span class="text-caption text-medium-emphasis">{{ label }}</span>
    </v-col>
    <v-col align="end">
      <v-dialog
        v-model="dialog"
        scrollable
        width="auto"
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
          <v-card-title>
            <span class="text-h6">{{ label }}</span>
          </v-card-title>
          <prism-editor
            class="my-editor"
            :model-value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :highlight="highlighter"
          ></prism-editor>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="info" @click="dialog = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
  <prism-editor
    class="my-editor mb-3"
    :model-value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
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
  import { ref } from "vue"
  import { useDisplay } from "vuetify"

  defineProps(["modelValue", "label"])
  defineEmits(["update:modelValue"])

  const dialog = ref(false)
  const { mobile } = useDisplay()

  const highlighter = (code) => {
    return highlight(code, languages.js) // languages.<insert language> to return html with markup
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
