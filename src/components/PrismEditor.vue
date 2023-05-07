<template>
  <span class="text-caption text-medium-emphasis">{{ label }}</span>
  <prism-editor
    class="my-editor mb-3"
    :model-value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :highlight="highlighter"
  ></prism-editor>
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

  defineProps(["modelValue", "label"])
  defineEmits(["update:modelValue"])

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
