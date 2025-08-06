<template>
  <v-row v-if="isEditing" align="center" class="mb-2">
    <v-col>
      <v-text-field 
        v-model="localValue" 
        :label="label" 
        hide-details 
        @keydown.enter="save" />
    </v-col>
    <v-col cols="4">
        <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-floppy'
        @click="save"
      ></v-btn>
      <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-cancel'
        @click="cancel"
        @keydown.enter="save"
      ></v-btn>
    </v-col>
  </v-row>
  <v-row v-else align="center" class="mb-2">
    <v-col>
      <v-text-field 
        v-model="model" 
        :label="label" 
        :disabled=true 
        hide-details 
        @keydown.enter="save" />
    </v-col> 
    <v-col cols="4">
    <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-rename'
        @click="startEditing"
      ></v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  //console.log(">>> Creating IdTextEdit...")
  
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit";
  import { useWorldStore } from "@/stores/WorldStore"
  import { ref } from "vue"

  // Listen for selection changes
  SAGEdit.Events.on("selectionChanged", (selectedId: string) => {
      // Cancel any ID edits, as likely lost focus for item we were editing
      cancel()
    },
    this
  )

  const model = defineModel()  // this is the v-model binding

  const props = defineProps({  // This is for extra props
    type: {
      type: String,
      default: "text"
    },
    label: {
      type: String,
      default: "text"
    }
  })

  const isEditing = ref(false)
  const localValue = ref("")

  // Start editing
  function startEditing() {
    localValue.value = model.value  // copy model into local editable value
    isEditing.value = true
  }

  // Save changes
  function save() {
    let oldValue = model.value
    model.value = localValue.value  // push local value back to parent
    isEditing.value = false

    // Maintain current selection by keeping curr ID in sync
    switch (props.type) {
          case "sequence": {
            // Realign "orphaned" child objects in scene
            // (now sequence id has been renamed)
            SAGEdit.Events.emit("sequenceIdRenamed", oldValue, localValue.value)
            useWorldStore().currSequenceId = localValue.value
            break
          }
          case "scene": {
            // Realign "orphaned" child objects in scene
            // (now scene id has been renamed)
            SAGEdit.Events.emit("sceneIdRenamed", oldValue, localValue.value)
            useWorldStore().currSceneId = localValue.value
            break
          }
          case "actor": {
            useWorldStore().currActorId = localValue.value
            break
          }
          case "prop": {
            useWorldStore().currPropId = localValue.value
            break
          }
          case "door": {
            useWorldStore().currDoorId = localValue.value
            break
          }
        }
  }

  // Cancel editing
  function cancel() {
    isEditing.value = false
  }


</script>
