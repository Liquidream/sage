import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import App from "./App.vue"
import vuetify from "./plugins/vuetify"
import { loadFonts } from "./plugins/webfontloader"
import { PixiApp } from "./app/PixiApp"

loadFonts()

const pinia = createPinia().use(piniaPluginPersistedstate)

createApp(App).use(vuetify).use(pinia).mount("#app")

PixiApp.initialize()

/*
BEFORE vuetify... 

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());

app.mount("#app");

*/
