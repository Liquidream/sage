<template>
  <v-app style="height: 100vh">
    <!-- Added to force bottom container to show scrollbar? -->

    <!-- For some reason had to add some padding at top to get 
         canvas to v-center properly in landscape mode -->
    <v-main :class="!isPortrait ? 'd-flex justify-center align-center' : ''">
      <canvas :class="isPortrait ? 'mt-0 mb-0' : ''" id="pixi-canvas"></canvas>

      <!-- <v-container height="75" fluid class="pa-0 flex-column">
        <v-spacer></v-spacer>
        <SceneList v-model="selectedModelID" :show="true" />
      </v-container> -->
    </v-main>

    <v-app-bar v-if="!isPortrait" flat height="75" location="bottom" order="1">
      <SceneList v-model="selectedModelID" />
    </v-app-bar>

    <v-app-bar :elevation="2" :density="!isPortrait ? 'default' : 'compact'">
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            :size="mobile ? 'small' : 'default'"
            icon="mdi-dots-vertical"
            v-bind="props"
          ></v-btn>
        </template>

        <v-list>
          <v-list-item prepend-icon="mdi-import" @click="loadGame">
            Load Game
          </v-list-item>
          <v-list-item prepend-icon="mdi-content-save" @click="saveGame">
            Save Game
          </v-list-item>
          <v-list-item prepend-icon="mdi-export" @click="exportGame">
            Export Game
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            :size="mobile ? 'small' : 'default'"
            icon="mdi-plus"
            v-bind="props"
            color="info"
            variant="tonal"
          ></v-btn>
        </template>

        <v-list>
          <v-list-item prepend-icon="mdi-filmstrip-box" @click="addScene">
            Add Scene
          </v-list-item>
          <v-list-item prepend-icon="mdi-trophy" @click="addProp">
            Add Prop
          </v-list-item>
          <v-list-item prepend-icon="mdi-door" @click="addDoor">
            Add Door
          </v-list-item>
          <v-list-item prepend-icon="mdi-account" @click="addActor">
            Add Actor
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- <v-toolbar-title><strong>SAGE</strong> - Simple Adventure Game Engine</v-toolbar-title> -->
      <v-img class="ma-4" src="images/app-images/sage-logo-small.png"></v-img>
      <v-btn
        :size="mobile ? 'small' : 'default'"
        @click="SAGEdit.playGame"
        color="info"
        prepend-icon="mdi-play"
        >Play</v-btn
      >

      <!-- <v-btn
        :size="mobile ? 'small' : 'default'"
        @click="exportGame"
        color="info"
        prepend-icon="mdi-content-save"
      >
        Export
      </v-btn> -->
      <!-- <v-btn icon="mdi-fullscreen" @click="Fullscreen.toggleFullScreen"></v-btn> -->
    </v-app-bar>

    <!-- Landscape/Desktop Layout (Start) =============== -->

    <v-navigation-drawer
      v-if="!isPortrait"
      permanent
      touchless
      :width="SAGEdit.navWidth"
    >
      <v-container id="mainContainer" class="pa-2">
        <ActorProperties v-if="worldRefs.currActorId.value != ''" />
        <DoorProperties v-else-if="worldRefs.currDoorId.value != ''" />
        <PropProperties v-else-if="worldRefs.currPropId.value != ''" />
        <SceneProperties v-else-if="worldRefs.currSceneId.value != ''" />
        <WorldProperties v-else-if="worldRefs.currSceneId.value == ''" />
        <p class="text-caption text-disabled text-right">
          SAGE built: {{ timeAgo }}
        </p>
      </v-container>
    </v-navigation-drawer>

    <!-- Landscape/Desktop Layout (End) =================== -->

    <!-- Portrait/Mobile Layout (Start) =================== -->

    <v-container v-if="isPortrait" style="overflow-y: scroll" class="pa-0">
      <v-container class="pa-0">
        <SceneList v-model="selectedModelID" />
      </v-container>
      <v-container class="pa-4">
        <ActorProperties v-if="worldRefs.currActorId.value != ''" />
        <DoorProperties v-else-if="worldRefs.currDoorId.value != ''" />
        <PropProperties v-else-if="worldStore.currPropId != ''" />
        <SceneProperties v-else-if="worldStore.currSceneId != ''" />
        <WorldProperties v-else-if="worldStore.currSceneId == ''" />
        <p class="text-caption text-disabled text-right">
          SAGE built: {{ timeAgo }}
        </p>
      </v-container>
    </v-container>

    <!-- Portrait/Mobile Layout (End) ========================= -->
  </v-app>
  <ReloadPrompt style="z-index: 2000" />
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch } from "vue"
  import { useDisplay } from "vuetify"
  import { Fullscreen } from "./utils/Fullscreen"
  import { SAGEdit } from "./pixi-sagedit/SAGEdit"
  import { useWorldStore } from "@/stores/WorldStore"
  import WorldProperties from "./components/WorldProperties.vue"
  import SceneProperties from "./components/SceneProperties.vue"
  import PropProperties from "./components/PropProperties.vue"
  import DoorProperties from "./components/DoorProperties.vue"
  import ActorProperties from "./components/ActorProperties.vue"
  import { useSceneStore } from "./stores/SceneStore"
  import { useActorStore } from "./stores/ActorStore"
  import { useDoorStore } from "./stores/DoorStore"
  import { usePropStore } from "./stores/PropStore"
  import type { SagePlayData } from "./pixi-sageplay/SagePlayData"
  import { FileUtils } from "./utils/FileUtils"
  import { useSageEditStore } from "./stores/SAGEditStore"
  import { usePlayerStore } from "./stores/PlayerStore"
  import type { SceneModel } from "./models/SceneModel"
  import { PropLocationType, PropModel } from "./models/PropModel"
  import { DoorModel } from "./models/DoorModel"
  import { storeToRefs } from "pinia"
  import ReloadPrompt from "./components/ReloadPrompt.vue"
  import { useTimeAgo } from "@vueuse/core"
  import SceneList from "@/components/SceneList.vue"
  import { ActorLocationType, type ActorModel } from "./models/ActorModel"

  // replaced dyanmicaly
  const date = "__DATE__"
  const timeAgo = useTimeAgo(date)

  const { mobile } = useDisplay()

  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)

  // Used for scene-switching (as also need to change other values)
  const selectedModelID = worldRefs.currSceneId

  // Once worldStore fully loaded...
  worldStore.$persistedState.isReady().then(() => {
    // ...watch for changes to scene selection
    // (+set other values)
    watch(
      selectedModelID,
      async (newSelectedModel: string, oldSelectedModel: string) => {
        //debugger
        console.log(
          `oldSelectedModel=${oldSelectedModel}, newSelectedModel=${newSelectedModel}`
        )
        // Set new scene
        worldStore.currSceneId = newSelectedModel
        // Deselect anything else
        worldStore.currPropId = ""
        worldStore.currDoorId = ""
        worldStore.currActorId = ""
      }
    )
  })

  const loadGame = () => {
    console.log(">> Load game")
    FileUtils.performLoad()
  }

  const saveGame = () => {
    console.log(">> Save game")
    FileUtils.performSave()
  }

  const exportGame = () => {
    console.log("in exportGame()...")
    FileUtils.performExport()
  }

  const addScene = () => {
    console.log(">> Add scene")
    const newScene: SceneModel = {
      id: "scn_",
      name: "New Scene",
      // Using the image file caused flicker (prob coz not using Assets?)
      image:
        "data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADm0MLC/wPUCbAV3BkcJAAAAABJRU5ErkJggg==",
      //image: "/images/scene-placeholder.png",
    }
    useWorldStore().createScene(newScene)
    // Now set it as current scene
    useWorldStore().currSceneId = newScene.id
  }
  const addProp = () => {
    console.log(">> Add prop")
    const newProp: PropModel = {
      id: "prp_",
      name: "New Prop",
      location_id: useWorldStore().currSceneId,
      location_type: PropLocationType.Scene,
      image:
        "data:image/png;base64,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",
      // image: "/images/placeholder.png",
      x: SAGEdit.width / 2,
      y: SAGEdit.height / 2,
      width: 256,
      height: 256,
      orig_width: 256,
      orig_height: 256,
      scale: 1,
      preserve_aspect: true,
      pickupable: true,
      visible: true,
    }
    usePropStore().createProp(newProp)
    // Unset any other selection
    useWorldStore().currDoorId = ""
    useWorldStore().currActorId = ""
    // Now set it as current prop
    useWorldStore().currPropId = newProp.id

    SAGEdit.Events.emit("propAdded", newProp)
  }
  const addDoor = () => {
    console.log(">> Add door")
    const newDoor: DoorModel = {
      id: "dor_",
      name: "New Door",
      location_id: useWorldStore().currSceneId,
      x: SAGEdit.width / 2,
      y: SAGEdit.height / 2,
      width: 256,
      height: 256,
      orig_width: 256,
      orig_height: 256,
      scale: 1,
      preserve_aspect: false,
      playSounds: true,
      visible: true,
    }
    useDoorStore().createDoor(newDoor)
    // Unset any other selection
    useWorldStore().currPropId = ""
    useWorldStore().currActorId = ""
    // Now set it as current scene
    useWorldStore().currDoorId = newDoor.id

    SAGEdit.Events.emit("doorAdded", newDoor)
  }
  const addActor = () => {
    console.log(">> Add actor")
    const newActor: ActorModel = {
      id: "act_",
      name: "New Actor",
      location_id: useWorldStore().currSceneId,
      location_type: ActorLocationType.Scene,
      image:
        "data:image/png;base64,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",
      // image: "/images/placeholder.png",
      x: SAGEdit.width / 2,
      y: SAGEdit.height / 2,
      width: 256,
      height: 256,
      orig_width: 256,
      orig_height: 256,
      scale: 1,
      preserve_aspect: true,
      visible: true,
    }
    useActorStore().createActor(newActor)
    // Unset any other selection
    useWorldStore().currPropId = ""
    useWorldStore().currDoorId = ""
    // Now set it as current actor
    useWorldStore().currActorId = newActor.id

    SAGEdit.Events.emit("actorAdded", newActor)
  }

  console.log("start App.vue...")
  // current screen size
  const gameWidth = 1920
  const gameHeight = 1080
  const display = ref(useDisplay())
  const isPortrait = computed(() => {
    SAGEdit.resize()
    const currPort = display.value.height > display.value.width
    return currPort
  })

  // Delay initialising and using Pixi until the cavas element is in the DOM
  onMounted(() => {
    console.log(`the component is now mounted.`)

    // Initialise Pixi (with a "black" default bg color)
    SAGEdit.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)
    SAGEdit.loadWorld()
  })

  // worldStore.$persistedState.isReady().then(() => {
  //   SAGEdit.initialize(gameWidth, gameHeight, 0x0) //0x6495ed) //0x0)
  //   SAGEdit.loadWorld()
  // })

  // const playGame = () => {
  //   console.log("in playGame()...")
  //   // Get the current "edit" data
  //   const editStore = useSageEditStore()
  //   const playData = {} as SagePlayData
  //   playData.version = editStore.version
  //   // TODO: This needs to be pulled somewhere from storage (prob playData store?)
  //   playData.id = editStore.gameId
  //   playData.worldData = JSON.stringify(useWorldStore().$state)
  //   playData.sceneData = JSON.stringify(useSceneStore().$state)
  //   playData.propData = JSON.stringify(usePropStore().$state)
  //   playData.doorData = JSON.stringify(useDoorStore().$state)
  //   playData.actorData = JSON.stringify(useActorStore().$state)
  //   playData.playerData = JSON.stringify(usePlayerStore().$state)

  //   window.sagePlayData = playData

  //   //navigator.clipboard.writeText(JSON.stringify(playData))
  //   //window.sagePlayDataJSON = JSON.stringify(playData)

  //   // Launch "Play" window
  //   window.open("?mode=play", "sagePlay")
  // }
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
