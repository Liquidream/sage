<template>
  <v-app>
    <v-navigation-drawer
      permanent
      disable-resize-watcher
      v-model="drawer"
      touchless
      :width="350"
    >
      <v-toolbar dense>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title>SAGE</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-cog</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-toolbar>

      <div class="pa-2">
        <!-- Nav bar content area -->
        <SceneProperties />
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
  // import type { Ref } from "vue"
  // import { ref } from "vue"
  // import { PropModel } from "./models/PropModel"
  import SceneProperties from "./components/SceneProperties.vue"
  //import { useSceneStore } from "./stores/SceneStore"

  const drawer = true
  //const model = new PropModel()

  //const sceneStore = useSceneStore()
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
