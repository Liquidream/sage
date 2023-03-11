<template>
  <v-form>
    <v-btn @click="backBtnClicked" color="info" class="mt-2">Back</v-btn>
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Prop Name -->
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
      label="Image"
      accept="image/png, image/jpeg, image/bmp"
      placeholder="Pick a backdrop image"
      prepend-icon="mdi-camera"
    ></v-file-input>
    <v-img :src="model.image" max-height="150" />
    <v-textarea
      name="desc"
      v-model="model.desc"
      label="Description"
      auto-grow
      rows="2"
    ></v-textarea>

    <v-divider />
    <v-list-subheader>Events</v-list-subheader>
    <v-textarea
      name="on_action"
      v-model="model.on_action"
      label="On Action"
      auto-grow
      rows="2"
    ></v-textarea>

    <v-textarea
      name="on_use"
      v-model="model.on_use"
      label="On Use"
      auto-grow
      rows="2"
    ></v-textarea>

    <!-- <v-btn @click="loadBtnClicked" color="info" class="mt-2">Load</v-btn> -->
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import type { PropModel } from "@/models/PropModel"
  import { usePropStore } from "@/stores/PropStore"

  const worldStore = useWorldStore()
  const propStore = usePropStore()

  const model = worldStore.getCurrentProp || ({} as PropModel)
  let chosenFile: any
  //let imageData: any = ""
  const imageData: Ref<string | ArrayBuffer | null> = ref("")

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

  const backBtnClicked = () => {
    worldStore.currPropId = ""
  }

  let motionExpand: false
</script>
