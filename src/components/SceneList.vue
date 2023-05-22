<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-sheet class="mx-auto" max-width="100%">
    <v-slide-group v-model="value" mandatory center-active show-arrows>
      <v-slide-group-item
        v-for="(scene, index) in scenes"
        :key="scene.id"
        :value="scene.id"
        v-slot="{ isSelected, toggle }"
      >
        <v-img
          :src="
            scene.thumbnail != '' && scene.thumbnail !== undefined
              ? scene.thumbnail
              : scene.image
          "
          class="ma-4"
          width="100"
          @click="toggle"
          style="cursor: pointer"
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
          <v-tooltip activator="parent" location="top">{{
            scene.name
          }}</v-tooltip>
        </v-img>
      </v-slide-group-item>
    </v-slide-group>
  </v-sheet>
</template>

<script setup lang="ts">
  import { useWorldStore } from "@/stores/WorldStore"
  import { computed, ref } from "vue"
  import { storeToRefs } from "pinia"

  const worldStore = useWorldStore()
  const worldRefs = storeToRefs(worldStore)
  const scenes = worldRefs.getScenes

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
