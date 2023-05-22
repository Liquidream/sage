<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-sheet class="mx-auto" elevation="8" max-width="100%">
    <v-slide-group v-model="value" class="pa-4" mandatory center-active show-arrows>
      <v-slide-group-item
        v-for="(scene, index) in scenes" :key="scene.id" :value="scene"
        v-slot="{ isSelected, toggle }"
      >
        <v-img
        :src="(scene.thumbnail != '' && scene.thumbnail !== undefined) ? scene.thumbnail : scene.image" 
        :aspect-ratio="16 / 9"
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
                icon="mdi-eye"
              ></v-icon>
            </v-scale-transition>
          </div>
        </v-img>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup lang="ts">
  import { useWorldStore } from "@/stores/WorldStore"
  import { computed, ref } from "vue"

  const worldStore = useWorldStore()
  const scenes = worldStore.getScenes

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
