<template>
  <v-app style="height: 100vh">
    <!-- Added to force bottom container to show scrollbar? -->

    <!-- For some reason had to add some padding at top to get 
         canvas to v-center properly in landscape mode -->
    <v-main :class="!isPortrait ? 'pt-8' : ''">
      <canvas :class="isPortrait ? 'mt-0 mb-0' : ''" id="pixi-canvas"></canvas>
    </v-main>

    <v-app-bar :elevation="2">
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            :size="$vuetify.display.mobile ? 'small' : 'default'"
            icon="mdi-plus"
            v-bind="props"
            color="info"
            variant="tonal"
          ></v-btn>
        </template>

        <v-list>
          <v-list-item prepend-icon="mdi-filmstrip-box" @click="addScene">
            Add Scene
          </v-list-item>
          <v-list-item prepend-icon="mdi-trophy" @click="addProp">
            Add Prop
          </v-list-item>
          <v-list-item prepend-icon="mdi-door" @click="addDoor">
            Add Door
          </v-list-item>
        </v-list>
      </v-menu>
      <!-- <v-toolbar-title><strong>SAGE</strong> - Simple Adventure Game Engine</v-toolbar-title> -->
      <v-img src="/images/app-images/sage-logo-small.png"></v-img>
      <v-btn
        :size="$vuetify.display.mobile ? 'small' : 'default'"
        @click="playGame"
        color="info"
        prepend-icon="mdi-play"
        >Play</v-btn
      >

      <v-btn
        :size="$vuetify.display.mobile ? 'small' : 'default'"
        @click="exportGame"
        color="info"
        prepend-icon="mdi-content-save"
      >
        Export
      </v-btn>
      <!-- <v-btn icon="mdi-fullscreen" @click="Fullscreen.toggleFullScreen"></v-btn> -->
    </v-app-bar>

    <!-- Landscape/Desktop Layout (Start) =============== -->

    <v-navigation-drawer
      v-if="!isPortrait"
      permanent
      touchless
      :width="SAGEdit.navWidth"
    >
      <v-container id="mainContainer" class="pa-2">
        <DoorProperties v-if="worldRefs.currDoorId.value != ''" />
        <PropProperties v-else-if="worldRefs.currPropId.value != ''" />
        <SceneProperties v-else-if="worldRefs.currSceneId.value != ''" />
        <WorldProperties v-else-if="worldRefs.currSceneId.value == ''" />
      </v-container>
    </v-navigation-drawer>

    <!-- Landscape/Desktop Layout (End) =================== -->

    <!-- Portrait/Mobile Layout (Start) =================== -->

    <v-container v-if="isPortrait" style="overflow-y: scroll">
      <DoorProperties v-if="worldStore.currDoorId != ''" />
      <PropProperties v-else-if="worldStore.currPropId != ''" />
      <SceneProperties v-else-if="worldStore.currSceneId != ''" />
      <WorldProperties v-else-if="worldStore.currSceneId == ''" />
    </v-container>

    <!-- Portrait/Mobile Layout (End) ========================= -->
  </v-app>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from "vue"
  import { useDisplay } from "vuetify"
  import { Fullscreen } from "./utils/Fullscreen"
  import { SAGEdit } from "./pixi-sagedit/SAGEdit"
  import { useWorldStore } from "@/stores/WorldStore"
  import WorldProperties from "./components/WorldProperties.vue"
  import SceneProperties from "./components/SceneProperties.vue"
  import PropProperties from "./components/PropProperties.vue"
  import DoorProperties from "./components/DoorProperties.vue"
  import { useSceneStore } from "./stores/SceneStore"
  import { useActorStore } from "./stores/ActorStore"
  import { useDoorStore } from "./stores/DoorStore"
  import { usePropStore } from "./stores/PropStore"
  import type { SagePlayData } from "./pixi-sageplay/SagePlayData"
  import { SAGExport } from "./pixi-sagedit/SAGExport"
  import { useSageEditStore } from "./stores/SAGEditStore"
  import { usePlayerStore } from "./stores/PlayerStore"
  import type { SceneModel } from "./models/SceneModel"
  import { LocationType, PropModel } from "./models/PropModel"
  import { DoorModel } from "./models/DoorModel"
  import { storeToRefs } from "pinia"

  const addScene = () => {
    console.log(">> Add scene")
    const newScene: SceneModel = {
      id: "scn_",
      name: "New Scene",
      // Using the image file caused flicker (prob coz not using Assets?)
      image: "data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADm0MLC/wPUCbAV3BkcJAAAAABJRU5ErkJggg==",
      //image: "/images/scene-placeholder.png",
    }
    useWorldStore().createScene(newScene)
    // Now set it as current scene
    useWorldStore().currSceneId = newScene.id
  }
  const addProp = () => {
    console.log(">> Add prop")
    const newProp: PropModel = {
      id: "prp_",
      name: "New Prop",
      location_id: useWorldStore().currSceneId,
      location_type: LocationType.Scene,
      image: "/images/placeholder.png",
      x: SAGEdit.width / 2,
      y: SAGEdit.height / 2,
      width: 256,
      height: 256,
    }
    usePropStore().createProp(newProp)
    // Now set it as current scene
    useWorldStore().currPropId = newProp.id
  }
  const addDoor = () => {
    console.log(">> Add door")
    const newDoor: DoorModel = {
      id: "dor_",
      name: "New Door",
      location_id: useWorldStore().currSceneId,
      x: SAGEdit.width / 2,
      y: SAGEdit.height / 2,
      width: 256,
      height: 256,
    }
    useDoorStore().createDoor(newDoor)
    // Now set it as current scene
    useWorldStore().currDoorId = newDoor.id
  }

  console.log("start App.vue...")
  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  const display = ref(useDisplay())

  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)

  const isPortrait = computed(() => {
    SAGEdit.resize()
    const currPort = display.value.height > display.value.width
    return currPort
  })

  // Delay initialising and using Pixi until the cavas element is in the DOM
  onMounted(() => {
    console.log(`the component is now mounted.`)

    // Initialise Pixi (with a "black" default bg color)
    SAGEdit.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)
    SAGEdit.loadWorld()
  })

  const playGame = () => {
    console.log("in playGame()...")
    // Get the current "edit" data
    const editStore = useSageEditStore()
    const playData = {} as SagePlayData
    playData.version = editStore.version
    // TODO: This needs to be pulled somewhere from storage (prob playData store?)
    playData.id = editStore.gameId
    playData.worldData = JSON.stringify(useWorldStore().$state)
    playData.sceneData = JSON.stringify(useSceneStore().$state)
    playData.propData = JSON.stringify(usePropStore().$state)
    playData.doorData = JSON.stringify(useDoorStore().$state)
    playData.actorData = JSON.stringify(useActorStore().$state)
    playData.playerData = JSON.stringify(usePlayerStore().$state)

    window.sagePlayData = playData

    //navigator.clipboard.writeText(JSON.stringify(playData))
    //window.sagePlayDataJSON = JSON.stringify(playData)

    // Launch "Play" window
    window.open("/?mode=play", "sagePlay")
  }

  const exportGame = () => {
    console.log("in exportGame()...")

    SAGExport.performExport()
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    overflow: hidden !important;
  }
</style>
