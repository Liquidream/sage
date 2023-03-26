<!-- https://vuejs.org/guide/components/v-model.html#component-v-model -->
<template>
  <v-select
    :label="label"
    :items="propStore.getProps"
    item-title="name"
    item-value="id"
    v-model="value"
  >
    <template v-slot:selection="{ item }">
      <!-- item, index-->
      <v-row align="center" class="mb-n5">
        <v-col class="text-left">
          <img
            :src="item.raw.image"
            style="width: 50px; height: 50px; object-fit: contain"
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
            <v-img :src="item.raw.image" max-height="50" />
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
  import { usePropStore } from "../stores/PropStore"

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

  const propStore = usePropStore()
</script>
