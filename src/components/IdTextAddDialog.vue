<template>
  <v-dialog v-model="open" max-width="400">
    <v-form v-model="isFormValid">
      <v-card>
        <v-card-title class="text-h6">{{ _title }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="input"
            :label="_label"
            autofocus
            clearable
            :rules="[rules.required, rules.unique, rules.noSpaces]"
            @keydown.enter="confirm"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="cancel">Cancel</v-btn>
          <v-btn 
            color="primary" 
            text 
            @click="confirm"
            :disabled="!isFormValid"
          >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
  //console.log(">>> Creating IdTextEdit...")
  
  import { useWorldStore } from "@/stores/WorldStore"
  import { shallowRef } from "vue"

  const open = shallowRef(false);
  const _title = shallowRef("");
  const _label = shallowRef("");
  const input = shallowRef("");
  const isFormValid = shallowRef(false)
  let resolver: ((value: string) => void) | null = null
  let rejecter: ((reason?: any) => void) | null = null

  interface PromptDialogOptions {
    title: string
    label: string
  }

  function promptDialog({ title, label }: PromptDialogOptions) {
    _title.value = title;
    _label.value = label;
    input.value = "";
    open.value = true;

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
  }

  function confirm() {
    if (!isFormValid.value){
      console.error("Abort save as form is invalid")
      return;
    }
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
    // https://www.geeksforgeeks.org/javascript/javascript-program-to-check-if-a-string-contains-any-whitespace-characters/
    noSpaces: value => !/\s/.test(value) || 'ID cannot contain spaces',
  }

</script>
