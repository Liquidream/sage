<template>
  <v-form>
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        Scene Name
        <!-- {{ sceneName }} -->
      </div>
    </div>

    <v-divider />
    <v-list-subheader>General</v-list-subheader>

    <v-text-field label="ID"></v-text-field>
    <v-text-field label="Name" v-model="sceneStore.name"></v-text-field>
    <v-file-input
      accept="image/png, image/jpeg, image/bmp"
      placeholder="Pick a backdrop image"
      prepend-icon="mdi-camera"
      label="Image"
    ></v-file-input>
    <v-file-input
      accept="audio/mpeg, audio/ogg, audio/vnd.wav"
      placeholder="Pick a backdrop sound"
      prepend-icon="mdi-volume-high"
      label="Sound"
    ></v-file-input>

    <v-divider />
    <v-list-subheader>Props</v-list-subheader>
    <!-- on click, replace panel with properties of Prop + select it in scene -->
    <v-list :items="modelProps"></v-list>

    <v-divider />
    <v-list-subheader>Doors</v-list-subheader>
    <!-- on click, replace panel with properties of Door + select it in scene -->
    <v-list :items="modelDoors"></v-list>

    <v-divider />
    <v-list-subheader>Events</v-list-subheader>
    <v-textarea name="on_enter" label="On Enter" auto-grow></v-textarea>
    <v-textarea name="on_exit" label="On Exit" auto-grow></v-textarea>

    <v-btn @click="loadBtnClicked" color="info" class="mt-2">Load</v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { PropModel } from "../models/PropModel"
  import { useSceneStore } from "../stores/SceneStore"
  import { SceneModel } from "../models/SceneModel"

  const sceneStore = useSceneStore()
  const sceneModel = new SceneModel()

  // sceneStore.$subscribe((mutation, state) => {
  //   console.log("state updated - so refresh scene model (pixi)")
  //   sceneModel.teardown()
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model: Ref<any> = ref(null)
  model.value = new PropModel()
  //let drawer = true

  const modelProps = [
    {
      title: "Old Lamp",
      value: 1,
    },
    {
      title: "Silver Key",
      value: 3,
    },
    {
      title: "Gold Bar",
      value: 3,
    },
  ]

  const modelDoors = [
    {
      title: "Cave Entrance",
      value: 1,
    },
    {
      title: "Bridge",
      value: 3,
    },
    {
      title: "Fortress",
      value: 3,
    },
  ]

  const loadBtnClicked = () => {
    sceneStore.load()

    model.value = new PropModel()
    model.value.createCircle()
  }

  const createBtnClicked = () => {
    //model = new PropModel()
    //model.createCircle();

    model.value = new PropModel()
    model.value.createCircle()
  }

  const closeDrawer = () => {
    console.log("close drawer...")
    // doesn't work, currently
    // (missing something - would be nice to have this optional for mobile, etc.)
    //drawer = false
  }

  let motionExpand: false
</script>
