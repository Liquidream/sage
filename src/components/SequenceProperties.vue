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
  <v-btn variant="plain" size="small" prepend-icon="mdi-link" disabled
    >Sequence</v-btn
  >

  <v-form v-if="model">
    <div class="header pa-3">
      <div class="mt-2 text-h5">
        <!-- Sequence Name -->
        {{ model.name }}
      </div>
    </div>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon> General</v-list-subheader
    >

    <IdTextEdit label="ID" type="sequence" v-model="model.id" />
    <!-- <v-text-field
      label="ID"
      :value="model.id"
      @input="idUpdated"
      dirty
    ></v-text-field> -->
    <v-text-field label="Id" v-model="model.id"></v-text-field>

    <v-text-field label="Name" v-model="model.name"></v-text-field>

    <!-- <v-row align="center">
      <v-col cols="4" class="pl-5">
        <ImageFileInputBtn v-model:model-value="model.image" v-model:thumbnail="model.thumbnail"></ImageFileInputBtn>
      </v-col>
      <v-col class="text-medium-emphasis">Backdrop image/video</v-col>
    </v-row> -->

    
    <v-divider />

    <v-btn @click="worldStore.deleteSequence(model.id)" color="error" class="mt-2"
      >Remove Sequence</v-btn
    >
  </v-form>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import { storeToRefs } from "pinia"

  import IdTextEdit from "./IdTextEdit.vue"

  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)

  const model = worldRefs.getCurrentSequence
  //const model = worldStore.getCurrentScene || ({} as SceneModel)

  const backToWorldClicked = () => {
    worldStore.currPropId = ""
    worldStore.currSequenceId = ""
    worldStore.currSceneId = ""
    worldStore.currSequenceId = ""
    // Force scroll to top of nav panel
    document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  // const idUpdated = (evt) => {
  //   console.log(">>> sceneId edited, so keep it 'current'")
  //   console.debug(evt)
  //   model.value.id = evt.target.value
  //   useWorldStore().currSceneId = evt.target.value
  // }

</script>
