<template>
  <v-form>
    <!-- <div class="header pa-3">
      <div class="mt-2 text-h5">World Settings</div>
    </div> -->
    <!-- <v-divider /> -->

    <v-list-subheader>General</v-list-subheader>

    <v-text-field label="Title" v-model="worldStore.title"></v-text-field>

    <v-divider />
    <v-list-subheader>Scenes</v-list-subheader>
    <!-- on click, replace panel with properties of Prop + select it in scene -->
    <v-list :items="modelScenes"></v-list>

    <v-divider />
    <v-list-subheader>Events</v-list-subheader>
    <v-textarea name="on_start" label="On Start" auto-grow></v-textarea>

    <v-btn @click="loadBtnClicked" color="info" class="mt-2">Load</v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { useWorldStore } from "../stores/index"

  const worldStore = useWorldStore()

  const modelScenes = [
    {
      title: "Bridge",
      value: 1,
    },
    {
      title: "Cave Entrance",
      value: 3,
    },
    {
      title: "Fortress",
      value: 3,
    },
  ]

  const loadBtnClicked = () => {
    //worldStore.load()
  }

  const addSceneClicked = () => {
    //
  }
</script>
