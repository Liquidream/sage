<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-sheet class="mx-auto" elevation="8" max-width="100%">
    <v-slide-group v-model="value" class="pa-4" mandatory center-active show-arrows>
      <v-slide-group-item
        v-for="n in 15"
        :key="n"
        v-slot="{ isSelected, toggle }"
      >
        <v-card
          :color="isSelected ? 'primary' : 'grey-lighten-1'"
          class="ma-4"
          height="200"
          width="100"
          @click="toggle"
        >
          <div class="d-flex fill-height align-center justify-center">
            <v-scale-transition>
              <v-icon
                v-if="isSelected"
                color="white"
                size="48"
                icon="mdi-close-circle-outline"
              ></v-icon>
            </v-scale-transition>
          </div>
        </v-card>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue"

  // import { computed } from "vue"
  // import { useWorldStore } from "../stores/WorldStore"
  // import { useDisplay } from "vuetify"
  // import { storeToRefs } from "pinia"

  // const { xl } = useDisplay()

  //let model = ref(2)

  // const worldStore = useWorldStore()
  // const worldRefs = storeToRefs(worldStore)
  // // const models = worldRefs.getScenes
  // const models = worldStore.getScenes

  // const paneHeight = computed(() => {
  //   return xl ? 192 : 144
  // })
  // const selectedIndex = computed(() => {
  //   return models.findIndex((model) => model.id === value.value)
  // })

  //let model = ref(2)

  // const onCardClick = (n: number) => {
  //   //model.value = n - 1
  //   emit("update:modelValue", value)
  // }

  const props = defineProps(["modelValue", "show"])
  const emit = defineEmits(["update:modelValue"])

  const value = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit("update:modelValue", value)
    },
  })
</script>
