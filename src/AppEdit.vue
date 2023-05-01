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
      image: "/images/scene-placeholder.png",
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
