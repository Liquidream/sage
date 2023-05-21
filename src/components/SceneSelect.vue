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
            :src="(item.raw.thumbnail != '' && item.raw.thumbnail !== undefined) ? item.raw.thumbnail : item.raw.image"
            style="max-width: 100%; aspect-ratio: 16/9; object-fit: cover"
          />
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
              :src="(item.raw.thumbnail != '' && item.raw.thumbnail !== undefined) ? item.raw.thumbnail : item.raw.image"
              :aspect-ratio="16 / 9"
              cover
            />
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
