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
  <v-btn variant="plain" size="small" prepend-icon="mdi-door" disabled
    >Door</v-btn
  >

  <v-form v-if="model">
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Door Name -->
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
    <v-textarea
      name="desc"
      v-model="model.desc"
      label="Description"
      auto-grow
      rows="1"
    ></v-textarea>
    <v-textarea
      name="desc_locked"
      v-model="model.desc_locked"
      label="Description (Locked)"
      auto-grow
      rows="1"
    ></v-textarea>

    <scene-select label="Target Scene" v-model="model.target_scene_id" />

    <v-select
      label="State"
      v-model="model.state"
      :items="['LOCKED', 'UNLOCKED']"
      :prepend-inner-icon="
        model.state === 'LOCKED' ? 'mdi-lock' : 'mdi-lock-open-variant'
      "
    ></v-select>
    <prop-select label="Key Prop" v-model="model.key_prop_id" hide-details />

    <v-tooltip
      text="Auto-unlock if player has key prop in their inventory?"
      location="bottom"
    >
      <template v-slot:activator="{ props }">
        <v-switch
          label="Auto Unlock"
          v-model="model.auto_unlock"
          color="info"
          hide-details
          v-bind="props"
        ></v-switch>
      </template>
    </v-tooltip>

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
          hide-details
        ></v-text-field>
        <v-switch
          label="Keep Aspect?"
          v-model="model.preserve_aspect"
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
      </v-col>
    </v-row>

    <v-row align="center" class="mt-n5">
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
      <v-col class="pl-5 text-medium-emphasis">Door image</v-col>
    </v-row>
    
    <v-row class="mt-n5">
      <v-col>
        <v-tooltip
          text="Whether to play door sfx (e.g. locked door, key turn) when interacted"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-switch
              label="Play Sounds"
              v-model="model.playSounds"
              color="info"
              hide-details
              v-bind="props"
            ></v-switch>
          </template>
        </v-tooltip>
      </v-col>
       <v-col>
          <v-switch
          label="Visible"
          v-model="model.visible"
          color="info"
          hide-details
        ></v-switch>
      </v-col>
    </v-row>

    <!-- Fair to assume location id is always a scene (in design?) -->
    <scene-select label="Location" v-model="model.location_id" />

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-lightning-bolt"></v-icon> Events</v-list-subheader
    >

    <prism-editor label="On Action" v-model="model.on_action" />

    <!-- <v-textarea
      name="on_action"
      v-model="model.on_action"
      label="On Action"
      auto-grow
      rows="2"
    ></v-textarea> -->

    <v-divider />

    <v-btn @click="removeDoorClicked" color="error" class="mt-2"
      >Remove Door</v-btn
    >
  </v-form>
</template>

<script setup lang="ts">
  import { watch, type Ref } from "vue"
  import { ref } from "vue"
  import { storeToRefs } from "pinia"
  import { useWorldStore } from "../stores/WorldStore"
  import type { DoorModel } from "@/models/DoorModel"
  import SceneSelect from "./SceneSelect.vue"
  import PropSelect from "./PropSelect.vue"
  import { useDoorStore } from "@/stores/DoorStore"
  import { BaseTexture } from "pixi.js"
  import PrismEditor from "./PrismEditor.vue"
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit"

  const worldStore = useWorldStore()
  const doorStore = useDoorStore()
  const worldRefs = storeToRefs(worldStore)
  const model = worldRefs.getCurrentDoor || ({} as DoorModel)

  watch(
    () => model.value,
    () => {
      console.log("door model changed")
      if (model.value !== undefined) {
        SAGEdit.Events.emit("doorUpdated", model.value)
        // Check to see whether door moved OUT of current scene
        // (didn't want to do it here, but the deep watch means I can't do listen to property change)
        if (model.value.location_id !== worldRefs.currSceneId.value) {
          // Deselect door
          worldStore.currDoorId = ""
        }
      }
    },
    { deep: true }
  )

  //const model = worldStore.getCurrentDoor || ({} as DoorModel)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chosenFile: any
  const imageData: Ref<string | ArrayBuffer | null> = ref("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeImage = () => {
    document.getElementById('uploader').click()
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
          const aspect = base.width / base.height
          if (base.width > SAGEdit.width - 64) {
            model.value.width = SAGEdit.width - 64
            model.value.height = model.value.width / aspect
          } else if (base.height > SAGEdit.height - 64) {
            model.value.height = SAGEdit.height - 64
            model.value.width = model.value.height * aspect
          } else {
            model.value.width = base.width
            model.value.height = base.height
          }
          model.value.orig_width = base.width
          model.value.orig_height = base.height
        } else {
          // ...else grab dimensions one texture fully loaded
          base.on("loaded", () => {
            if (model.value) {
              const aspect = base.width / base.height
              if (base.width > SAGEdit.width - 64) {
                model.value.width = SAGEdit.width - 64
                model.value.height = model.value.width / aspect
              } else if (base.height > SAGEdit.height - 64) {
                model.value.height = SAGEdit.height - 64
                model.value.width = model.value.height * aspect
              } else {
                model.value.width = base.width
                model.value.height = base.height
              }
              model.value.orig_width = base.width
              model.value.orig_height = base.height
            }
          })
        }
      }
    }
  }

  const backToWorldClicked = () => {
    worldStore.currDoorId = ""
    worldStore.currSceneId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const backToSceneClicked = () => {
    worldStore.currDoorId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const idUpdated = (evt) => {
    console.log(">>> doorId edited, so keep it 'current'")
    console.debug(evt)
    model.value.id = evt.target.value
    useWorldStore().currDoorId = evt.target.value
  }

  const removeDoorClicked = () => {
    SAGEdit.Events.emit("doorRemoved", model.value)
    doorStore.deleteDoor(model.value.id)
  }
</script>
