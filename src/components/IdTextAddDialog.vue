<template>
  <v-dialog v-model="open" max-width="400">
    <v-card>
      <v-card-title class="text-h6">{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="input"
          :label="label"
          autofocus
          clearable
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="cancel">Cancel</v-btn>
        <v-btn color="primary" text @click="confirm">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  //console.log(">>> Creating IdTextEdit...")
  
  import { useWorldStore } from "@/stores/WorldStore"
  import { shallowRef } from "vue"

  const open = shallowRef(false);
  const title = shallowRef("");
  const label = shallowRef("");
  const input = shallowRef("");
  let resolver, rejecter;

  function promptDialog({ t, l }) {
    title.value = t;
    label.value = l;
    input.value = "";
    open.value = true;

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
  }

  function confirm() {
    open.value = false;
    resolver?.(input.value);
  }

  function cancel() {
    open.value = false;
    rejecter?.(new Error("cancelled"));
  }

  // expose the function so parent can call it
  defineExpose({ promptDialog });

  const rules = {
    required: value => !!value || 'ID is required',
    unique: value => {
      //debugger
      let countOfSameId = 0
      countOfSameId += useWorldStore().getSequences.filter(seq => seq.id === value).length
      countOfSameId += useWorldStore().getScenes.filter(scene => scene.id === value).length
      countOfSameId += useWorldStore().getProps.filter(prop => prop.id === value).length
      countOfSameId += useWorldStore().getDoors.filter(door => door.id === value).length
      countOfSameId += useWorldStore().getActors.filter(actor => actor.id === value).length
      return countOfSameId == 0 || 'ID must be unique'
    },
  }

</script>
