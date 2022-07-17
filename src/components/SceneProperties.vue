<template>
  <div class="header pa-3">
    <div class="mt-2 text-h5">
      Scene Name
      <!-- {{ sceneName }} -->
    </div>
  </div>
  <v-divider />

  <v-list lines="three">
    <v-list-subheader>User Controls</v-list-subheader>

    <v-list-item>
      <v-list-item-header>
        <v-list-item-title>Content filtering</v-list-item-title>
        <v-list-item-subtitle
          >Set the content filtering level to restrict appts that can be
          downloaded</v-list-item-subtitle
        >
      </v-list-item-header>
    </v-list-item>

    <v-list-item>
      <v-list-item-header>
        <v-list-item-title>Password</v-list-item-title>
        <v-list-item-subtitle
          >Require password for purchase or use password to restrict
          purchase</v-list-item-subtitle
        >
      </v-list-item-header>
    </v-list-item>
  </v-list>

  <v-divider></v-divider>

  <v-list lines="three" select-strategy="multiple">
    <v-list-subheader>General</v-list-subheader>

    <v-list-item value="notifications">
      <template v-slot:default="{ isActive }">
        <v-list-item-avatar start>
          <v-checkbox :model-value="isActive" hide-details></v-checkbox>
        </v-list-item-avatar>

        <v-list-item-header>
          <v-list-item-title>Notifications</v-list-item-title>
          <v-list-item-subtitle
            >Notify me about updates to apps or games that I
            downloaded</v-list-item-subtitle
          >
        </v-list-item-header>
      </template>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-slider
          dense
          class="mt-2"
          prepend-icon="mdi-magnify"
          min="0.01"
          max="3"
          step="0.01"
          v-model="model.Y"
          :messages="String(model.Y)"
        ></v-slider>
      </v-list-item-content>
    </v-list-item>

    <v-list-item value="sound">
      <template v-slot:default="{ isActive }">
        <v-list-item-avatar start>
          <v-checkbox :model-value="isActive" hide-details></v-checkbox>
        </v-list-item-avatar>

        <v-list-item-header>
          <v-list-item-title>Sound</v-list-item-title>
          <v-list-item-subtitle
            >Auto-update apps at any time. Data charges may
            apply</v-list-item-subtitle
          >
        </v-list-item-header>
      </template>
    </v-list-item>

    <v-list-item value="widgets">
      <template v-slot:default="{ isActive }">
        <v-list-item-avatar start>
          <v-checkbox :model-value="isActive" hide-details></v-checkbox>
        </v-list-item-avatar>

        <v-list-item-header>
          <v-list-item-title>Auto-add widgets</v-list-item-title>
          <v-list-item-subtitle
            >Automatically add home screen widgets when downloads
            complete</v-list-item-subtitle
          >
        </v-list-item-header>
      </template>
    </v-list-item>
  </v-list>

  <v-divider />

  <v-list expand>
    <v-list-group :value="true">
      <template v-slot:activator>
        <v-list-item-content>
          <v-list-item-title>General</v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item>
        <v-list-item-content>
          <div>
            <v-slider
              dense
              class="mt-2"
              prepend-icon="mdi-magnify"
              min="0.01"
              max="3"
              step="0.01"
              v-model="model.Y"
              :messages="String(model.Y)"
            ></v-slider>
            <v-slider
              dense
              class="mt-2"
              prepend-icon="mdi-rotate-right"
              min="0"
              max="6.28"
              step="0.01"
              v-model="model.Y"
              :messages="String(model.Y)"
            ></v-slider>
          </div>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
  </v-list>

  <v-list-group v-model="motionExpand">
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title class="text--secondary">Motions</v-list-item-title>
      </v-list-item-content>
    </template>
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
  </v-list-group>
</template>

<script setup lang="ts">
  import type { Ref } from "vue"
  import { ref } from "vue"
  import { PropModel } from "../models/PropModel"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model: Ref<any> = ref(null)
  model.value = new PropModel()
  //let drawer = true
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
    //drawer = false
  }

  let motionExpand: false
</script>
