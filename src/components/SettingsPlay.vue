<template>
  <v-dialog v-model="showDialog" max-width="500">
    <!-- <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        prepend-icon="mdi-cog"
        size="small"
        text="Settings"
        v-bind="activatorProps"
      ></v-btn>
    </template> -->

    <v-card>
      <v-toolbar>
        <v-btn icon="mdi-close" @click="showDialog = false"></v-btn>

        <v-toolbar-title>Settings</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items>
          <v-btn text="Close" variant="text" @click="showDialog = false"></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-list lines="two" subheader>
        <!-- <v-list-subheader>Game State</v-list-subheader> -->

        <v-btn text="Save Game" color="primary" variant="text" size="x-large" block @click="saveGameClicked"></v-btn>

        <v-btn text="Load Game" color="primary" variant="text" size="x-large" block @click="loadGameClicked"></v-btn>

        <v-btn text="Restart Game" color="primary" variant="text" size="x-large" block @click="restartGameClicked"></v-btn>

        <v-divider></v-divider>

        <v-list-subheader>General Settings</v-list-subheader>

        <v-btn text="Toggle Fullscreen" color="primary" variant="text" size="x-large" block @click="Fullscreen.toggleFullScreen()"></v-btn>

      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { SAGE } from "@/pixi-sageplay/SAGEPlay"
  import { onMounted, ref } from "vue"
  import { Fullscreen } from "@/utils/Fullscreen"

  const showDialog = ref(false)

  // const backToWorldClicked = () => {
  //   worldStore.currPropId = ""
  //   worldStore.currSceneId = ""
  //   // Force scroll to top of nav panel
  //   document.getElementById("mainContainer")?.parentElement?.scrollTo(0, 0)
  // }

  const saveGameClicked = () => {
    console.log("TODO: Save game...")
    SAGE.saveGame()
  }

  const loadGameClicked = () => {
    console.log("TODO: Load game...")
  }

  const restartGameClicked = () => {
    console.log("TODO: Restart game...")
  }

  // Delay initialising until SAGE has been fully initialised
  onMounted(() => {
    console.log(`>>> Mounting the settings component...`)
    // Listen for Prop created
    SAGE.Events.on(
      "settingsTapped",
      () => {
        showDialog.value = true
      },
      this
    )
  })
</script>
