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

    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon> General</v-list-subheader
    >

    <v-text-field label="Title" v-model="worldStore.title"></v-text-field>

    <v-text-field
      label="ID"
      v-model="worldStore.id"
      hint="Unique reference for data storage"
    ></v-text-field>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-filmstrip-box"></v-icon> Scenes</v-list-subheader
    >
    <!-- on click, replace panel with properties of Scene -->
    <v-list>
      <v-list-item
        @click="onClickScene(scene)"
        v-for="scene in worldStore.getScenes"
        :key="scene.id"
      >
        <v-row align="center">
          <v-col cols="3">
            <v-img v-if="scene.image.includes('image')" :src="scene.image" :aspect-ratio="16 / 9" cover />
            <video v-else-if="scene.image.includes('video')" preload="metadata" style="display: block; width: inherit">
              <source :src="scene.image" type="video/mp4" />
            </video>
          </v-col>
          <v-col>
            <span class="text-no-wrap">{{ scene.name }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>

    <scene-select label="Starting Scene" v-model="worldStore.startingSceneId" />

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-lightning-bolt"></v-icon> Events</v-list-subheader
    >

    <prism-editor label="On Start" v-model="worldStore.on_start" />

    <v-divider />

    <v-btn @click="SampleData.resetToDemoData" color="info" class="mt-2"
      >Reset Data</v-btn
    >
    <!-- &nbsp;
    <v-btn @click="worldStore.exportDataToJSON" color="info" class="mt-2"
      >Export Data</v-btn
    > -->
    <!-- &nbsp;
    <v-btn @click="worldStore.loadPlayData" color="info" class="mt-2"
      >Load Data</v-btn
    > -->
  </v-form>
</template>

<script setup lang="ts">
  import type { SceneModel } from "@/models/SceneModel"
  import { SAGEdit } from "../pixi-sagedit/SAGEdit"
  import { useWorldStore } from "../stores/WorldStore"
  import { SampleData } from "../stores/SampleData"
  import SceneSelect from "./SceneSelect.vue"
  import PrismEditor from "./PrismEditor.vue"

  console.log("start WordProperties.vue...")
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
