<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-select
    :label="label"
    :items="worldStore.getScenes"
    item-title="name"
    item-value="id"
    v-model="value"
  >
    <template v-slot:selection="{ item }">
      <!-- item, index-->
      <v-row align="center">
        <v-col class="text-left" cols="3">
          <img
            v-if="item.raw?.image?.includes('image')"
            :src="item.raw.image"
            style="max-width: 100%; aspect-ratio: 16/9; object-fit: cover"
          />
          <video
            v-else-if="item.raw?.image?.includes('video')"
            preload="metadata"
            class="mb-2"
            style="display: block; width: inherit"
          >
            <source :src="item.raw.image" type="video/mp4" />
          </video>
        </v-col>
        <v-col class="text-left mt-n2">
          <span class="text-no-wrap">{{ item.title }}</span>
        </v-col>
      </v-row>
    </template>

    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" title="">
        <v-row align="center">
          <v-col cols="3">
            <v-img
              v-if="item.raw.image.includes('image')"
              :src="item.raw.image"
              :aspect-ratio="16 / 9"
              cover
            />
            <video
              v-else-if="item.raw.image.includes('video')"
              preload="metadata"
              :style="
                $vuetify.display.mobile
                  ? 'display: block; width:inherit'
                  : 'display: block; width:55px'">
              <source :src="item.raw.image" type="video/mp4" />
            </video>
          </v-col>
          <v-col>
            {{ item.title }}
          </v-col>
        </v-row>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
  import { computed } from "vue"
  import { useWorldStore } from "../stores/WorldStore"

  const props = defineProps(["modelValue", "label"])
  const emit = defineEmits(["update:modelValue"])
  const value = computed({
    get() {
      return props.modelValue
    },
    set(value) {
      emit("update:modelValue", value)
    },
  })

  const worldStore = useWorldStore()
</script>
