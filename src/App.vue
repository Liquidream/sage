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
        <WorldProperties v-if="worldStore.currSceneId == ''" />
        <SceneProperties v-if="worldStore.currSceneId != ''" />
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
  // import type { Ref } from "vue"
  // import { ref } from "vue"
  // import { PropModel } from "./models/PropModel" 
  import WorldProperties from "./components/WorldProperties.vue"
  import SceneProperties from "./components/SceneProperties.vue"
  import { SAGEdit } from "@/SAGEdit"

  import { useWorldStore } from "@/stores/index"
  //import { useSceneStore } from "./stores/SceneStore"

  const worldStore = useWorldStore()

  SAGEdit.loadWorld()

  const drawer = true
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
