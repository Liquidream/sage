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

  <v-form v-if="model">
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Prop Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon> General</v-list-subheader
    >
    <v-text-field
      label="ID"
      :value="model.id"
      @input="idUpdated"
      dirty
    ></v-text-field>
    <v-text-field label="Name" v-model="model.name"></v-text-field>

    <v-row align="center" class="mb-1">
      <v-col cols="4">
        <v-file-input
          v-model="chosenFile"
          type="file"
          @change="onImageFileChange"
          accept="image/png, image/jpeg, image/bmp"
          placeholder="Pick a backdrop image"
          id="uploader"
          class="d-none"
        ></v-file-input>
        <v-img
          :src="model.image"
          height="50"
          hide-details
          @click="changeImage"
          align="center"
        >
          <v-btn
            class="mt-2 elevation-2"
            icon="mdi-camera"
            variant="outlined"
            size="x-small"
          ></v-btn>
        </v-img>
      </v-col>
      <v-col class="pl-5 text-medium-emphasis">Prop image</v-col>
    </v-row>

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
          v-model.number="model.x"
          type="number"
        ></v-text-field>
        <v-text-field
          label="Width"
          v-model.number="model.width"
          type="number"
        ></v-text-field>
        <v-switch
          label="Pickupable"
          v-model="model.pickupable"
          color="info"
          hide-details
        ></v-switch>
        <v-switch
          label="Single Use"
          v-model="model.single_use"
          color="info"
          hide-details
        ></v-switch>
      </v-col>
      <v-col>
        <v-text-field
          label="Y-Pos"
          v-model.number="model.y"
          type="number"
        ></v-text-field>
        <v-text-field
          label="Height"
          v-model.number="model.height"
          type="number"
        ></v-text-field>
        <!-- <v-switch
          label="Draggable"
          v-model="model.draggable"
          color="info"
          hide-details
        ></v-switch> -->
        <v-switch
          label="Visible"
          v-model="model.visible"
          color="info"
          hide-details
        ></v-switch>
      </v-col>
    </v-row>

    <!-- Fair to assume location id is always a scene (in design?) -->
    <scene-select
      label="Location"
      v-model="model.location_id"
      @update:model-value="propLocationUpdated"
    />

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-lightning-bolt"></v-icon> Events</v-list-subheader
    >

    <prism-editor label="On Action" v-model="model.on_action" />

    <prism-editor label="On Use" v-model="model.on_use" />

    <v-divider />

    <v-btn @click="removePropClicked" color="error" class="mt-2"
      >Remove Prop</v-btn
    >
  </v-form>
</template>

<script setup lang="ts">
  import { watch, type Ref } from "vue"
  import { ref } from "vue"
  import { storeToRefs } from "pinia"
  import { useWorldStore } from "../stores/WorldStore"
  //import type { PropModel } from "@/models/PropModel"
  import { BaseTexture } from "pixi.js"
  import SceneSelect from "./SceneSelect.vue"
  import type { PropModel } from "@/models/PropModel"
  import { usePropStore } from "@/stores/PropStore"
  import PrismEditor from "./PrismEditor.vue"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  const worldStore = useWorldStore()
  const propStore = usePropStore()
  // Make prop info react when selection changes
  const worldRefs = storeToRefs(worldStore)
  const model = worldRefs.getCurrentProp || ({} as PropModel)

  watch(
    () => model.value,
    () => {
      console.log("prop model changed")
      if (model.value !== undefined) {
        SAGEdit.Events.emit("propUpdated", model.value)
      }
    },
    { deep: true }
  )

  const propLocationUpdated = (newValue) => {
    // Check to see whether prop moved OUT of current scene
    if (model.value !== worldRefs.currSceneId.value) {
      // Deselect prop
      worldRefs.currPropId.value = ""
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chosenFile: any
  //let imageData: any = ""
  const imageData: Ref<string | ArrayBuffer | null> = ref("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeImage = () => {
    document.getElementById("uploader").click()
  }
  const onImageFileChange = (e: any) => {
    const reader = new FileReader()
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      imageData.value = reader.result
      if (model.value) {
        model.value.image = reader.result as string // added "as" to squash error/warn, ok?
        // Now do a test load into Pixi texture to get dimensions
        const base = new BaseTexture(model.value.image)
        // If previously cached texture, get dimensions immediately
        if (base.valid) {
          model.value.width = base.width
          model.value.height = base.height
        } else {
          // ...else grab dimensions one texture fully loaded
          base.on("loaded", () => {
            if (model.value) {
              model.value.width = base.width
              model.value.height = base.height
            }
          })
        }
      }
    }
  }

  const backToWorldClicked = () => {
    worldStore.currPropId = ""
    worldStore.currSceneId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const backToSceneClicked = () => {
    worldStore.currPropId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const idUpdated = (evt) => {
    console.log(">>> prpId edited, so keep it 'current'")
    console.debug(evt)
    model.value.id = evt.target.value
    useWorldStore().currPropId = evt.target.value
  }

  const removePropClicked = () => {
    SAGEdit.Events.emit("propRemoved", model.value)
    propStore.deleteProp(model.value.id)
  }
</script>
