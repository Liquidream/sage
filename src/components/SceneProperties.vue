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

    <v-text-field label="ID" v-model="model.id"></v-text-field>
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
    <v-img :src="model.image" max-height="150" />

    <v-file-input
      class="mt-8"
      accept="audio/mpeg, audio/ogg, audio/vnd.wav"
      placeholder="Pick a backdrop sound"
      prepend-icon="mdi-volume-high"
      label="Background Sound"
    ></v-file-input>

    <v-divider />
    <v-list-subheader>Props</v-list-subheader>
    <!-- on click, replace panel with properties of Prop + select it in scene -->
    <v-list
      :items="propStore.findPropBySceneId(worldStore.currSceneId)"
      item-title="name"
      item-value="id"
      @click:select="propSelected"
    ></v-list>

    <v-divider />
    <v-list-subheader>Doors</v-list-subheader>
    <!-- on click, replace panel with properties of Door + select it in scene -->
    <v-list
      :items="doorStore.findDoorBySceneId(worldStore.currSceneId)"
      item-title="name"
      item-value="id"
    ></v-list>

    <v-divider />

    <v-list-subheader>Events</v-list-subheader>
    <v-textarea
      name="on_enter"
      v-model="model.on_enter"
      label="On Enter"
      auto-grow
      rows="2"
    ></v-textarea>

    <v-textarea
      name="on_exit"
      v-model="model.on_exit"
      label="On Exit"
      auto-grow
      rows="2"
    ></v-textarea>

    <!-- <v-btn @click="loadBtnClicked" color="info" class="mt-2">Load</v-btn> -->
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  //import { PropModel } from "../models/PropModel"
  //import { useSceneStore } from "../stores/SceneStore"
  import { useWorldStore } from "../stores/WorldStore"
  import type { SceneModel } from "@/models/SceneModel"
  import type { PropModel } from "@/models/PropModel"
  import { usePropStore } from "@/stores/PropStore"
  import { useDoorStore } from "@/stores/DoorStore"

  const worldStore = useWorldStore()
  const propStore = usePropStore()
  const doorStore = useDoorStore()

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
      model.image = reader.result as string // added "as" to squash error/warn, ok?
    }
  }

  const loadBtnClicked = () => {
    //sceneStore.load()
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

  const propSelected = (value: {
    id: unknown
    value: boolean
    path: unknown[]
  }) => {
    worldStore.currPropId = value.id as string
  }

  let motionExpand: false
</script>
