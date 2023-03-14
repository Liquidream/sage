<template>
  <!-- Breadcrumbs -->
  <v-btn
    variant="plain"
    size="small"
    prepend-icon="mdi-earth"
    @click="backToWorldClicked"
    >World</v-btn
  >
  <v-icon icon="mdi-chevron-right"></v-icon>
  <v-btn
    variant="plain"
    size="small"
    prepend-icon="mdi-filmstrip-box"
    @click="backToSceneClicked"
    >Scene</v-btn
  >
  <v-icon icon="mdi-chevron-right"></v-icon>
  <v-btn variant="plain" size="small" prepend-icon="mdi-trophy" disabled
    >Prop</v-btn
  >

  <v-form>
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Prop Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon>General</v-list-subheader
    >
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

    <v-row>
      <v-col>
        <v-text-field
          label="X-Pos"
          v-model="model.x"
          type="number"
        ></v-text-field>
        <v-text-field
          label="Width"
          v-model="model.width"
          type="number"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          label="Y-Pos"
          v-model="model.y"
          type="number"
        ></v-text-field>
        <v-text-field
          label="Height"
          v-model="model.height"
          type="number"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-lightning-bolt"></v-icon>Events</v-list-subheader
    >
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
  import { BaseTexture } from "pixi.js"
  //import { usePropStore } from "@/stores/PropStore"

  const worldStore = useWorldStore()
  //const propStore = usePropStore()
  const model = worldStore.getCurrentProp || ({} as PropModel)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chosenFile: any
  //let imageData: any = ""
  const imageData: Ref<string | ArrayBuffer | null> = ref("")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFileChange = (e: any) => {
    //debugger
    const reader = new FileReader()
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      imageData.value = reader.result
      model.image = reader.result as string // added "as" to squash error/warn, ok?
      // Now do a test load into Pixi texture to get dimensions
      const base = new BaseTexture(model.image)
      base.on("loaded", () => {
        model.width = base.width
        model.height = base.height
      })
    }
  }

  const backToWorldClicked = () => {
    worldStore.currPropId = ""
    worldStore.currSceneId = ""
    parent.scrollY > 0
  }

  const backToSceneClicked = () => {
    worldStore.currPropId = ""
    parent.scrollY > 0
  }
</script>
