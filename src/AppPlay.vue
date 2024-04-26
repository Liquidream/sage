<template>
  <v-app>
    <v-main>
      <SettingsPlay v-if="loaded" />
      <canvas
        id="pixi-canvas"
        width="100%"
        height="100%"
        style="background: #000000"
      ></canvas>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue"
  //import { Fullscreen } from "./utils/Fullscreen"
  import { SAGE } from "./pixi-sageplay/SAGEPlay"
  import { LoaderScreen } from "./pixi-sageplay/screens/LoaderScreen"
  import SettingsPlay from "./components/SettingsPlay.vue";
import { useWorldStore } from "./stores/WorldStore";
import { usePropStore } from "./stores/PropStore";
import { useSceneStore } from "./stores/SceneStore";
import { useDoorStore } from "./stores/DoorStore";
import { useActorStore } from "./stores/ActorStore";
  //import type { SagePlayData } from "./pixi-sageplay/SagePlayData"

  console.log("start AppPlay.vue...")
  const loaded = ref(false) // delay load other elements until all initialised
  const dialog = ref(false)
  const notifications = ref(false)
  const sound = ref(true)
  const widgets = ref(false)

  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  // const display = ref(useDisplay())
  // const worldStore = useWorldStore()

  // const isPortrait = computed(() => {
  //   SAGE.resize()
  //   const currPort = display.value.height > display.value.width
  //   return currPort
  // })

  const worldStore = useWorldStore()
  const propStore = usePropStore()
  const sceneStore = useSceneStore()
  const doorStore = useDoorStore()
  const actorStore = useActorStore()

  // Delay initialising and using Pixi until the canvas element is in the DOM
  onMounted(() => {
    console.log(`>>> Mounting the AppPlay component...`)

    // Only proceed once ALL stores have fully loaded
    // (takes longer with IndexedDB)
    // Promise.all([
    //   worldStore.$persistedState.isReady(),
    //   sceneStore.$persistedState.isReady(),
    //   propStore.$persistedState.isReady(),
    //   doorStore.$persistedState.isReady(),
    //   actorStore.$persistedState.isReady(),
    // ]).then(() => {
      console.log("All stores hydrated pt.2, now initialise SAGE")

      // Add even MORE delay to test pinia hydration/overwrite issue...
      //setTimeout(() => { 
        // Initialise Pixi (with a "black" default bg color)
        SAGE.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)

        // pass in the screen size to avoid "asking up"
        const sceny: LoaderScreen = new LoaderScreen()
        console.log("changing screen to loader")
        SAGE.changeScreen(sceny)

        // all done now?
        loaded.value = true

     // }, 2000)

   // })
  })
</script>

<style>
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }

  /* #pixi-content {
    background: #000000;
    width: 100%;
    height: 100%; 
  }*/
</style>
