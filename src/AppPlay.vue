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

  // Delay initialising and using Pixi until the canvas element is in the DOM
  onMounted(() => {
    console.log(`>>> Mounting the AppPlay component...`)

    // Initialise Pixi (with a "black" default bg color)
    SAGE.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)

    // SAGE.loadWorld()
    //SAGE.startGame()

    // pass in the screen size to avoid "asking up"
    const sceny: LoaderScreen = new LoaderScreen()
    console.log("changing screen to loader")
    SAGE.changeScreen(sceny)

    // Play mode?
    // const queryString = window.location.search
    // const urlParams = new URLSearchParams(queryString)
    // const mode = urlParams.get("mode")
    // if (mode == "play") {
    //   //let app = createApp(AppServer);
    //   console.log(">>> Play/Test mode!22")
    //   const worldStore = useWorldStore()
    //}

    // all done now?
    loaded.value = true
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
