<template>
  <!-- Breadcrumbs -->
  <v-btn-group size="small" density="default" :divided=true variant="elevated">
  <v-btn 
      size="small" 
      class="flex-grow-1"
      prepend-icon="mdi-earth" 
      :disabled=true
      >World</v-btn
    >
  </v-btn-group>
  <v-form>
    <!-- <div class="header pa-3">
      <div class="mt-2 text-h5">World Settings</div>
    </div> -->
    <!-- <v-divider /> -->

    <v-list-subheader
      ><v-icon icon="mdi-view-list-outline"></v-icon> General</v-list-subheader
    >

    <v-text-field label="Title" v-model="worldStore.title"></v-text-field>

    <v-text-field
      label="ID"
      v-model="worldStore.id"
      hint="Unique reference for data storage"
    ></v-text-field>



    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-link"></v-icon> Sequences</v-list-subheader
    >
    <!-- on click, replace panel with properties of Sequence -->
    <v-list class="pt-0">
      <v-list-item
        @click="onClickSequence(sequence)"
        v-for="sequence in worldStore.getSequences"
        :key="sequence.id"
      >
        <v-row align="center">
          <!-- <v-col cols="3">
            <v-img :src="(sequence.thumbnail != '' && sequence.thumbnail !== undefined) ? sequence.thumbnail : sequence.image" :aspect-ratio="16 / 9" cover />

          </v-col> -->
          <v-col>
            <span class="text-no-wrap">{{ sequence.name }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>




    <!-- <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-filmstrip-box"></v-icon> Scenes</v-list-subheader
    >
    <v-list class="pt-0">
      <v-list-item
        @click="onClickScene(scene)"
        v-for="scene in worldStore.getScenes"
        :key="scene.id"
      >
        <v-row align="center">
          <v-col cols="3">
            <v-img :src="(scene.thumbnail != '' && scene.thumbnail !== undefined) ? scene.thumbnail : scene.image" :aspect-ratio="16 / 9" cover />

          </v-col>
          <v-col>
            <span class="text-no-wrap">{{ scene.name }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list> 
    -->

    <scene-select label="Starting Scene" v-model="worldStore.startingSceneId" />

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-account"></v-icon> Actors</v-list-subheader
    >
    <!-- on click, replace panel with properties of Scene -->
    <v-list class="pt-0">
      <v-list-item
        @click="onClickActor(actor)"
        v-for="actor in worldStore.getActors"
        :key="actor.id"
      >
        <v-row align="center">
          <v-col cols="3">
            <v-img :src="(actor.thumbnail != '' && actor.thumbnail !== undefined) ? actor.thumbnail : actor.image" :aspect-ratio="16 / 9" cover />

          </v-col>
          <v-col>
            <span class="text-no-wrap">{{ actor.name }}</span>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-trophy"></v-icon> Props</v-list-subheader
    >
    <!-- on click, replace panel with properties of Prop + select it in scene -->
    <v-list>
      <v-list-item
        @click="onClickProp(prop)"
        v-for="prop in propStore.getProps"
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

    <v-divider />
    <v-list-subheader
      ><v-icon icon="mdi-lightning-bolt"></v-icon> Events</v-list-subheader
    >

    <AceEditor label="On Start" type="scene" v-model="worldStore.script_on_start" />

    <AceEditor label="Functions" type="scene" v-model="worldStore.script_functions" />

    <v-divider />

    <v-btn :loading="loading" @click="handleConfirm" color="info" class="mt-2"
      >Reset Data</v-btn
    >
    <!-- &nbsp;
    <v-btn @click="worldStore.exportDataToJSON" color="info" class="mt-2"
      >Export Data</v-btn
    > -->
    <!-- &nbsp;
    <v-btn @click="worldStore.loadPlayData" color="info" class="mt-2"
      >Load Data</v-btn
    > -->
  </v-form>
</template>

<script setup lang="ts">
  import type { SceneModel } from "@/models/SceneModel"
  import { SAGEdit } from "../pixi-sagedit/SAGEdit"
  import { useWorldStore } from "../stores/WorldStore"
  import { SampleData } from "../stores/SampleData"
  import SceneSelect from "./SceneSelect.vue"

  import AceEditor from "./AceEditor.vue"

  import { ActorLocationType, type ActorModel } from "@/models/ActorModel"
  import { ref } from "vue"
  import type { SequenceModel } from "@/models/SequenceModel"
  import { useSequenceStore } from "@/stores/SequenceStore"
  import { usePropStore } from "@/stores/PropStore"
  import { PropLocationType, type PropModel } from "@/models/PropModel"

  import { useConfirm, useSnackbar } from 'vuetify-use-dialog'

  console.log("start WordProperties.vue...")
  
  const worldStore = useWorldStore()
  const propStore = usePropStore()

  const confirm = useConfirm()
  const toast = useSnackbar()

  async function handleConfirm() {
    const isConfirmed = await confirm({ 
      title: "Confirm Reset",
      content: `Are you sure you want to reset ALL data to the sample game?`,
      dialogProps: { width: 400, },
    })

    if (isConfirmed)
    {
      resetDataClicked()
    }
  }

  const onClickSequence = (sequence: SequenceModel) => {
    SAGEdit.debugLog("onClickSequence()...")
    SAGEdit.debugLog(sequence.name)

    worldStore.currSequenceId = sequence.id
  }

  // const onClickScene = (scene: SceneModel) => {
  //   SAGEdit.debugLog("onClickScene()...")
  //   SAGEdit.debugLog(scene.name)

  //   worldStore.currSceneId = scene.id
  // }

  const onClickActor = (actor: ActorModel) => {
    SAGEdit.debugLog("onClickActor()...")
    SAGEdit.debugLog(actor.name)

      // If setting scene, then also need to set sequence 
      // (unless actor not currenty within a scene)
      if (actor.location_id != "") {
        worldStore.currSequenceId = useSequenceStore().findSequenceBySceneId(actor.location_id).id
        
        // Also jump to the scene where actor is located
        // (helps keep things working properly, and if not in scene, should still work?)
        //debugger
        if (actor.location_type === ActorLocationType.Scene
        && actor.location_id) {
            worldStore.currSceneId = actor.location_id
        }  
    }
    
    // Select the actor (regardless of whether in a scene or not)
    worldStore.currActorId = actor.id
  }

  const onClickProp = (prop: PropModel) => {
    
    
    SAGEdit.debugLog("onClickProp()...")
    SAGEdit.debugLog(prop.name)

      // If setting scene, then also need to set sequence 
      // (unless prop not currently within a scene)
      if (prop.location_id != "") {
        worldStore.currSequenceId = useSequenceStore().findSequenceBySceneId(prop.location_id).id
        
        // Also jump to the scene where actor is located
        // (helps keep things working properly, and if not in scene, should still work?)
        //debugger
        if (prop.location_type === PropLocationType.Scene
        && prop.location_id) {
            worldStore.currSceneId = prop.location_id
        }  
    }
    
    // Select the prop (regardless of whether in a scene or not)
    worldStore.currPropId = prop.id
    
    
    // Force scroll to top of nav panel
    //document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  }

  const loading = ref(false)
  const resetDataClicked = async () => {
    loading.value = true
    await SampleData.resetToDemoData()
    loading.value = false
  }

  //const addSceneClicked = () => {
  //
  //}
</script>
