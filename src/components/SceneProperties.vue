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
  <v-btn variant="plain" size="small" prepend-icon="mdi-filmstrip-box" disabled
    >Scene</v-btn
  >

  <v-form v-if="model">
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Scene Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader>General</v-list-subheader>

    <v-text-field
      label="ID"
      :value="model.id"
      @input="idUpdated"
      dirty
    ></v-text-field>
    <v-text-field label="Name" v-model="model.name"></v-text-field>

    <!-- <v-row>
      <v-col>
        ssssdf sdf sdf sdf s
      </v-col>
      <v-col>
        
        <v-img :src="model.image" max-height="60" hide-details />
      </v-col>
    </v-row> -->

    <v-row align="center">
      <v-col class="pl-5">
        Backdrop image
      </v-col>
      <v-col>
        <ImageFileInputBtn v-model="model.image"></ImageFileInputBtn>
      </v-col>
    </v-row>

    <!-- <v-text-field label="Sound" v-model="model.sound"></v-text-field> -->
    <v-file-input
      class="mt-8"
      @change="onSoundFileChange"
      label="Background Sound"
      accept="audio/mpeg, audio/ogg, audio/vnd.wav"
      placeholder="Pick a backdrop sound"
      prepend-icon="mdi-volume-high"
    ></v-file-input>

    <v-divider />
    <v-list-subheader>Props</v-list-subheader>
    <!-- on click, replace panel with properties of Prop + select it in scene -->
    <v-list>
      <v-list-item
        @click="propSelected(prop)"
        v-for="prop in propStore.findPropBySceneId(worldStore.currSceneId)"
        :key="prop.id"
      >
        <v-row align="center">
          <v-col cols="3">
            <v-img :src="prop.image" max-height="50" />
          </v-col>
          <v-col>
            <span class="text-no-wrap">{{ prop.name }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>
    <!-- <v-list
      :items="propStore.findPropBySceneId(worldStore.currSceneId)"
      item-title="name"
      item-value="id"
      @click:select="propSelected"
    ></v-list> -->

    <v-divider />
    <v-list-subheader>Doors</v-list-subheader>

    <!-- on click, replace panel with properties of Door + select it in scene -->
    <v-list
      :items="doorStore.findDoorBySceneId(worldStore.currSceneId)"
      item-title="name"
      item-value="id"
      @click:select="doorSelected"
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

    <v-btn @click="worldStore.deleteScene(model.id)" color="error" class="mt-2"
      >Remove Scene</v-btn
    >
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import type { SceneModel } from "@/models/SceneModel"
  import { usePropStore } from "@/stores/PropStore"
  import { useDoorStore } from "@/stores/DoorStore"
  import { storeToRefs } from "pinia"
  import ImageFileInputBtn from "./ImageFileInputBtn.vue"

  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)
  const propStore = usePropStore()
  const doorStore = useDoorStore()

  const model = worldRefs.getCurrentScene
  //const model = worldStore.getCurrentScene || ({} as SceneModel)

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
      // debugger
      imageData.value = reader.result
      model.value.image = reader.result as string // added "as" to squash error/warn, ok?
    }
  }
  const soundData: Ref<string | ArrayBuffer | null> = ref("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSoundFileChange = (e: any) => {
    const reader = new FileReader()
    // Use the javascript reader object to load the contents
    // of the file in the v-model prop
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      // debugger
      soundData.value = reader.result
      model.value.sound = reader.result as string // added "as" to squash error/warn, ok?
    }
  }
  const backToWorldClicked = () => {
    worldStore.currPropId = ""
    worldStore.currSceneId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const idUpdated = (evt) => {
    console.log(">>> sceneId edited, so keep it 'current'")
    console.debug(evt)
    model.value.id = evt.target.value
    useWorldStore().currSceneId = evt.target.value
  }

  const propSelected = (value: {
    id: unknown
    value: boolean
    path: unknown[]
  }) => {
    worldStore.currPropId = value.id as string
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const doorSelected = (value: {
    id: unknown
    value: boolean
    path: unknown[]
  }) => {
    worldStore.currDoorId = value.id as string
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }
</script>
