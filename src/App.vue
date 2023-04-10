<template>
  <v-app style="height: 100vh">
    <!-- Added to force bottom container to show scrollbar? -->

    <!-- For some reason had to add some padding at top to get 
         canvas to v-center properly in landscape mode -->
    <v-main :class="!isPortrait ? 'pt-8' : ''">
      <canvas :class="isPortrait ? 'mt-0 mb-0' : ''" id="pixi-canvas"></canvas>
    </v-main>

    <v-app-bar :elevation="2">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>SAGE</v-toolbar-title>
      <v-btn @click="playGame" color="info"
      >Play</v-btn
      >
      <v-spacer></v-spacer>
      <v-btn icon @click="Fullscreen.toggleFullScreen">
        <v-icon>mdi-fullscreen</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Landscape/Desktop Layout (Start) =============== -->

    <v-navigation-drawer
      v-if="!isPortrait"
      permanent
      touchless
      :width="SAGEdit.navWidth"
    >
      <v-container id="mainContainer" class="pa-2">
        <WorldProperties v-if="worldStore.currSceneId == ''" />
        <SceneProperties
          v-if="
            worldStore.currSceneId != '' &&
            worldStore.currPropId == '' &&
            worldStore.currDoorId == ''
          "
        />
        <PropProperties v-if="worldStore.currPropId != ''" />
        <DoorProperties v-if="worldStore.currDoorId != ''" />
      </v-container>
    </v-navigation-drawer>

    <!-- Landscape/Desktop Layout (End) =================== -->

    <!-- Portrait/Mobile Layout (Start) =================== -->

    <v-container v-if="isPortrait" style="overflow-y: scroll">
      <WorldProperties v-if="worldStore.currSceneId == ''" />
      <SceneProperties
        v-if="
          worldStore.currSceneId != '' &&
          worldStore.currPropId == '' &&
          worldStore.currDoorId == ''
        "
      />
      <PropProperties v-if="worldStore.currPropId != ''" />
      <DoorProperties v-if="worldStore.currDoorId != ''" />
    </v-container>

    <!-- Portrait/Mobile Layout (End) ========================= -->
  </v-app>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue"
  import { useDisplay } from "vuetify"
  import { Fullscreen } from "./utils/Fullscreen"
  import { SAGEdit } from "@/SAGEdit"
  import { useWorldStore } from "@/stores/WorldStore"
  import { useSageEditStore } from "@/stores/SAGEditStore"
  import WorldProperties from "./components/WorldProperties.vue"
  import SceneProperties from "./components/SceneProperties.vue"
  import PropProperties from "./components/PropProperties.vue"
  import DoorProperties from "./components/DoorProperties.vue"
import { useSceneStore } from "./stores/SceneStore"
import { useActorStore } from "./stores/ActorStore"
import { useDoorStore } from "./stores/DoorStore"
import { usePropStore } from "./stores/PropStore"

  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  const display = ref(useDisplay())

  const worldStore = useWorldStore()

  const isPortrait = computed(() => {
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
    const sageEditStore = useSageEditStore()
    sageEditStore.worldData = JSON.stringify(useWorldStore())
    sageEditStore.sceneData = JSON.stringify(useSceneStore())
    sageEditStore.propData = JSON.stringify(usePropStore())
    sageEditStore.doorData = JSON.stringify(useDoorStore())
    sageEditStore.actorData = JSON.stringify(useActorStore())
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
