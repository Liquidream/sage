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

        <v-toolbar-title>Title</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn icon>
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </v-toolbar>

      <div class="pa-2">
        <v-btn
          @click="createBtnClicked"
          prepend-icon="mdi-cloud-upload"
          color="info"
          >Add Circle!</v-btn
        >

        <v-slider
          v-if="model != null"
          dense
          class="mt-2"
          prepend-icon="mdi-cursor-move"
          v-model="model.Y"
          :messages="String(model.Y)"
          min="100"
          max="1000"
          step="1"
        ></v-slider>

        <v-btn @click="closeDrawer" color="error" class="mt-2">Close</v-btn>
      </div>
    </v-navigation-drawer>
  </v-app>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { PropModel } from "./models/PropModel"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model: Ref<any> = ref(null)

  let drawer = true
  //const model = new PropModel()

  const createBtnClicked = () => {
    //model = new PropModel()
    //model.createCircle();

    model.value = new PropModel()
    model.value.createCircle()
  }

  const closeDrawer = () => {
    console.log("close drawer...")
    // doesn't work, currently
    // (missing something - would be nice to have this optional for mobile, etc.)
    drawer = false
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
