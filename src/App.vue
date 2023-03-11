<template>
  <v-app>
    <!-- 
      permanent 
      disable-resize-watcher
    -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="!!isMobile()"
      touchless
      :width="SAGEdit.navWidth"
    >
      <v-toolbar dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title>SAGE</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="Fullscreen.toggleFullScreen">
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <v-btn icon @click.stop="toggleDrawer">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-toolbar>

      <div class="pa-2">
        <!-- Nav bar content area -->
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
      </div>
    </v-navigation-drawer>

    <v-main align="center" justify="center">
      <!-- Provides the application the proper gutter -->
      <canvas id="pixi-canvas"></canvas>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  // import type { Ref } from "vue"
  // import { ref } from "vue"
  // import { PropModel } from "./models/PropModel"
  import WorldProperties from "./components/WorldProperties.vue"
  import SceneProperties from "./components/SceneProperties.vue"
  import PropProperties from "./components/PropProperties.vue"
  import DoorProperties from "./components/DoorProperties.vue"
  import { SAGEdit } from "@/SAGEdit"
  import { Fullscreen } from "./utils/Fullscreen"

  import { useWorldStore } from "@/stores/WorldStore"
  import { onMounted, ref } from "vue"
  //import { useSceneStore } from "./stores/SceneStore"

  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  //
  const worldStore = useWorldStore()

  //SAGEdit.loadWorld()

  const drawer = ref(true)

  const toggleDrawer = () => {
    console.log("toggle!")
    drawer.value = !drawer.value
    console.log(drawer)
  }

  const isMobile = () => screen.width <= 760

  // Delay initialising and using Pixi until the cavas element is in the DOM
  onMounted(() => {
    console.log(`the component is now mounted.`)

    // Initialise Pixi (with a "black" default bg color)
    SAGEdit.initialize(gameWidth, gameHeight, 0x6495ed) //0x0)

    SAGEdit.loadWorld()
  })
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
