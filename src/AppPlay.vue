<template>
  <v-app>
    <v-main>
      <SettingsPlay v-if="loaded" />
      <div ref="stage"
        id="pixi-canvas"
        width="100%"
        height="100%"
        style="background: #000000"
      ></div>
      <!-- <canvas
        id="pixi-canvas"
        width="100%"
        height="100%"
        style="background: #000000"
      ></canvas> -->
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue"
  //import { Fullscreen } from "./utils/Fullscreen"
  import { SAGE } from "./pixi-sageplay/SAGEPlay"
  import { LoaderScreen } from "./pixi-sageplay/screens/LoaderScreen"
  import SettingsPlay from "./components/SettingsPlay.vue"

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

  const stage = ref(null)
  // Delay initialising and using Pixi until the canvas element is in the DOM
  onMounted(async () => {
    console.log(`>>> Mounting the AppPlay component...`)

    // Initialise Pixi (with a "black" default bg color)
    await SAGE.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)

    // Seems only way it'll work atm 
    // (canvas: propery on app.init doesn't seem to work now?)
    // Found here: https://www.html5gamedevs.com/topic/55854-strange-behavior-when-using-pixijs-8-within-a-vuejs-component/
    stage.value.appendChild(SAGE._app.canvas)

    // pass in the screen size to avoid "asking up"
    const sceny: LoaderScreen = new LoaderScreen()
    console.log("changing screen to loader")
    SAGE.changeScreen(sceny)

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
