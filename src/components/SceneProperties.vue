<template>
  <v-form>
    <v-btn @click="backBtnClicked" color="info" class="mt-2">Back</v-btn>
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Scene Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader>General</v-list-subheader>

    <v-text-field label="ID"></v-text-field>
    <v-text-field label="Name" v-model="model.name"></v-text-field>
    <v-file-input
      v-model="chosenFile"
      type="file"
      @change="onFileChange"
      label="Backdrop Image"
      accept="image/png, image/jpeg, image/bmp"
      placeholder="Pick a backdrop image"
      prepend-icon="mdi-camera"
    ></v-file-input>
    <v-img :src="imageData" alt="test" />
    <v-file-input
      accept="audio/mpeg, audio/ogg, audio/vnd.wav"
      placeholder="Pick a backdrop sound"
      prepend-icon="mdi-volume-high"
      label="Background Sound"
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
  import { useWorldStore } from "../stores/index"
  import type { SceneModel } from "@/models/SceneModel"

  const sceneStore = useSceneStore()
  const worldStore = useWorldStore()
  // const sceneModel = new SceneModel()

  // sceneStore.$subscribe((mutation, state) => {
  //   console.log("state updated - so refresh scene model (pixi)")
  //   sceneModel.teardown()
  // }
  //console.log(worldStore.getCurrentScene)
  const model = worldStore.getCurrentScene || ({} as SceneModel)
  let chosenFile: any
    //let imageData: any = ""
  const imageData: Ref<string | ArrayBuffer | null> = ref("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const model: Ref<any> = ref(null)
  // model.value = new PropModel()
  //let drawer = true

  const onFileChange = (e: any) => {
    //debugger

    const reader = new FileReader()
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      imageData.value = reader.result
      model.image = reader.result
    }
  }

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
    // sceneStore.load()
    // model.value = new PropModel()
    // model.value.createCircle()
  }

  const createBtnClicked = () => {
    // model.value = new PropModel()
    // model.value.createCircle()
  }

  const backBtnClicked = () => {
    worldStore.currSceneId = ""
  }

  let motionExpand: false
</script>
