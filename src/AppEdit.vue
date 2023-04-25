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
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-plus" v-bind="props" color="info" variant="tonal"></v-btn>
        </template>

        <v-list>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            @click="item.func()"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>

            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-toolbar-title>SAGE</v-toolbar-title>
      <v-btn @click="playGame" color="info" prepend-icon="mdi-play">Play</v-btn>
      <v-spacer />
      <v-btn @click="exportGame" color="info" prepend-icon="mdi-content-save"
        >Export</v-btn
      >
      <v-spacer />
      <!-- <v-btn icon="mdi-plus"></v-btn> -->
      <v-btn icon="mdi-fullscreen" @click="Fullscreen.toggleFullScreen"></v-btn>
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

  // For some reason, it seems VERY hard to manually create a clickable list
  // So having to work with a bound one for now...
  const items = [
    {
      icon: "mdi-filmstrip-box",
      text: "Add Scene",
      func: () => {
        console.log(">> Add scene")
        const newScene: SceneModel = {
          id: "scn_",
          name: "New Scene",
        }
        useWorldStore().createScene(newScene)
        // Now set it as current scene
        useWorldStore().currSceneId = newScene.id
        // TODO: this will be issue if they then rename scene id
        // (need to handle that in sceneId text field to keep it current!)
      },
    },
    {
      icon: "mdi-trophy",
      text: "Add Prop",
      func: () => {
        console.log(">>>2")
      },
    },
    {
      icon: "mdi-door",
      text: "Add Door",
      func: () => {
        console.log(">>>3")
      },
    },
  ]
  const itemClicked = function (item: any) {
    console.log(`TODO: ${item.text}`)
  }

  console.log("start App.vue...")
  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  const display = ref(useDisplay())
  const worldStore = useWorldStore()

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
