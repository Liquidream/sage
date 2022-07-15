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

<!-- === Orig Vuetify Content ==================================================
  <template>
  <v-app>
    <v-main>
      <HelloWorld />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default defineComponent({
  name: "App",

  components: {
    HelloWorld,
  },

  data() {
    return {
      //
    };
  },
});
</script> -->

<!-- === Orig Vue Content ==================================================
  <script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import TheWelcome from "./components/TheWelcome.vue";
</script>

<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="./assets/logo.svg"
      width="125"
      height="125"
    />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style> -->
