<template>
  <!-- Breadcrumbs -->
  <v-btn variant="plain" size="small" prepend-icon="mdi-earth" disabled
    >World</v-btn
  >
  <v-form>
    <!-- <div class="header pa-3">
      <div class="mt-2 text-h5">World Settings</div>
    </div> -->
    <!-- <v-divider /> -->

    <v-list-subheader>General</v-list-subheader>

    <v-text-field label="Title" v-model="worldStore.title"></v-text-field>

    <v-divider />
    <v-list-subheader>Scenes</v-list-subheader>
    <!-- on click, replace panel with properties of Scene -->
    <v-list>
      <v-list-item
        @click="onClickScene(scene)"
        v-for="scene in worldStore.getScenes"
        :key="scene.id"
      >
        {{ scene.name }}
      </v-list-item>
    </v-list>

    <v-divider />
    <v-list-subheader>Events</v-list-subheader>
    <v-textarea
      name="on_start"
      v-model="worldStore.on_start"
      label="On Start"
      auto-grow
      rows="2"
    ></v-textarea>

    <v-btn @click="worldStore.resetToDemoData" color="info" class="mt-2"
      >Reset Data</v-btn
    >
  </v-form>
</template>

<script setup lang="ts">
  import type { SceneModel } from "@/models/SceneModel"
  import { SAGEdit } from "@/SAGEdit"
  // import type { Ref } from "vue"
  // import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"

  const worldStore = useWorldStore()

  const onClickScene = (scene: SceneModel) => {
    SAGEdit.debugLog("onClickScene()...")
    SAGEdit.debugLog(scene.name)

    worldStore.currSceneId = scene.id
  }

  //const loadBtnClicked = () => {
  //worldStore.load()
  //}

  //const addSceneClicked = () => {
  //
  //}
</script>
