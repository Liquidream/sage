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

  <v-form>
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Door Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon>General</v-list-subheader
    >
    <v-text-field label="ID" v-model="model.id"></v-text-field>
    <v-text-field label="Name" v-model="model.name"></v-text-field>
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

    <v-select
      label="Target Scene"
      v-model="model.target_scene_id"
      :items="worldStore.getScenes"
      item-title="name"
      item-value="id"
    >
      <template v-slot:item="{ item, props }">
        <v-list-item>
          <v-row>
            <v-col>
              <v-img :src="item.raw.image" max-height="50" />
            </v-col>
            <v-col>
              {{ item.title }}
            </v-col>
          </v-row>
        </v-list-item>
      </template>
    </v-select>

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

    <!-- <v-btn @click="loadBtnClicked" color="info" class="mt-2">Load</v-btn> -->
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import type { DoorModel } from "@/models/DoorModel"
  //import { useDoorStore } from "@/stores/DoorStore"

  const worldStore = useWorldStore()
  //const doorStore = useDoorStore()

  const model = worldStore.getCurrentDoor || ({} as DoorModel)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let chosenFile: any
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
    }
  }

  const backToWorldClicked = () => {
    worldStore.currDoorId = ""
    worldStore.currSceneId = ""
    parent.scrollY > 0
  }

  const backToSceneClicked = () => {
    worldStore.currDoorId = ""
    parent.scrollY > 0
  }
</script>
