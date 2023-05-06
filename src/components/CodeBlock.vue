<template>
  <prism-editor :code="code" :lang="lang"></prism-editor>
</template>

<script setup lang="ts">
  import { ref } from "vue"
  import PrismEditor from "./PrismEditor.vue"

  const code = ref("console.log(It's working)")
  const lang = ref("js")
</script>

<style></style>
