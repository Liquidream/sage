<script setup lang="ts">
  import { ref, onMounted } from "vue"
  import { useDisplay } from "vuetify"
  //import { Fullscreen } from "./utils/Fullscreen"
  import { SAGEdit } from "./pixi-sagedit/SAGEdit"
  import { useWorldStore } from "@/stores/WorldStore"
  //import type { SagePlayData } from "./pixi-sageplay/SagePlayData"

  console.log("start AppPlay.vue...")

  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  const display = ref(useDisplay())
  const worldStore = useWorldStore()

  // const isPortrait = computed(() => {
  //   const currPort = display.value.height > display.value.width
  //   return currPort
  // })

  // Delay initialising and using Pixi until the cavas element is in the DOM
  onMounted(() => {
    console.log(`the component is now mounted.`)

    // Initialise Pixi (with a "black" default bg color)
    SAGEdit.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)
    SAGEdit.loadWorld()

    // Play mode?
    // const queryString = window.location.search
    // const urlParams = new URLSearchParams(queryString)
    // const mode = urlParams.get("mode")
    // if (mode == "play") {
    //   //let app = createApp(AppServer);
    //   console.log(">>> Play/Test mode!22")
    //   const worldStore = useWorldStore()
    //}
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
