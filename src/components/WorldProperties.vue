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
            <v-img :src="scene.image" :aspect-ratio="16 / 9" cover />
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

    On Start
    <CodeBlock>fdfg df gdfg </CodeBlock>

    <!-- <v-textarea
      name="on_start"
      v-model="worldStore.on_start"
      label="On Start"
      auto-grow
      rows="2"
    ></v-textarea> -->

    <v-btn @click="worldStore.resetToDemoData" color="info" class="mt-2"
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
  // import type { Ref } from "vue"
  // import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import SceneSelect from "./SceneSelect.vue"

  // import { PrismEditor } from "vue-prism-editor"
  //import PrismEditor from "./PrismEditor.vue"
  import CodeBlock from "./CodeBlock.vue"

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
