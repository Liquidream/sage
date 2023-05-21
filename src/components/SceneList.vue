<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-slide-y-reverse-transition>
    <v-sheet class="model-list" width="100%">
      <v-item-group mandatory class="flex-grow-1" :value="selectedIndex">
        <transition-group class="model-group d-flex pa-1 pa-xl-2" name="move">
          <v-item
            v-for="model in models"
            :key="model.id"
            v-slot="{ active, toggle }"
          >
            <v-card color="#631f1f" class="ma-1 ma-xl-2" @click="toggle">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-img
                    :src="model.image"
                    :width="150"
                    :height="paneHeight"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <!-- <template v-slot:placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          v-if="!model.error"
                          indeterminate
                          color="grey lighten-5"
                        ></v-progress-circular>
                        <v-icon v-else>mdi-alert-circle</v-icon>
                      </v-row>
                    </template> -->

                    <v-card-title
                      class="ml-1 pa-0 flex-nowrap text-subtitle-2 text-xl-subtitle-1"
                    >
                      <span class="model-item-title text-truncate">{{
                        "#" + model.id + " " + model.name
                      }}</span>
                      <v-spacer></v-spacer>
                      <v-btn icon>
                        <v-icon size="20">mdi-close</v-icon>
                      </v-btn>
                    </v-card-title>
                  </v-img>
                </template>
                <!-- {{ model.error }} -->
              </v-tooltip>
            </v-card>
          </v-item>
        </transition-group>
      </v-item-group>
    </v-sheet>
  </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
  import { computed } from "vue"
  import { useWorldStore } from "../stores/WorldStore"
  import { useDisplay } from "vuetify"
  import { storeToRefs } from "pinia"

  const { xl } = useDisplay()
  
  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)
  // const models = worldRefs.getScenes
  const models = worldStore.getScenes

  const paneHeight = computed(() => {
    return xl ? 192 : 144
  })
  const selectedIndex = computed(() => {
    return models.findIndex((model) => model.id === value.value)
  })

  const props = defineProps(["value", "show"])
  const emit = defineEmits(["update:value"])
  const value = computed({
    get() {
      return props.value
    },
    set(value) {
      emit("update:value", value)
    },
  })
</script>

<!-- <style scoped lang="stylus">
  .model-list
    position relative
    background-color transparent !important
    pointer-events auto

    &:before
      content ''
      position absolute
      top 0
      right 0
      bottom 0
      left 0
      background-color rgba(0, 0, 0, .3)

  .model-group
    overflow auto

  .v-card
    pointer-events auto

  .model-item-title
    line-height 36px

  // animation

  .move-move
    transition transform .2s
</style> -->
