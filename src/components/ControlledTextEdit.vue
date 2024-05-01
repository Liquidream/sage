<template>
  <v-row align="center" class="mb-2">
    <v-col>
      <v-text-field
        :label="label"
        :value="model" /// need to do this on load only
        :disabled="!editMode"
        dirty
        hide-details
      ></v-text-field>
    </v-col>
    <v-col cols="2">
    <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        :icon="editMode ? 'mdi-floppy' : 'mdi-rename'"
        @click="editSaveClicked"
      ></v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { useWorldStore } from "@/stores/WorldStore"
  import { ref } from "vue"

  const model = defineModel({ type: String })
  const props = defineProps({
    label: String,
    type: String,
  })
  const editMode = ref(false)

  // When save clicked,
  //  - Check ID name is valid (unique)
  //  - Update value, but ensure current selection maintained
  const editSaveClicked = (evt) => {
    
    if (editMode.value) {
      // Save clicked
      console.log(">>> actId edited, so keep it 'current'")
      console.debug(evt)
      model.value = evt.target.value

      // Maintain current selection by keeping curr ID in sync
      switch (props.type) {
        case "scene": {
          useWorldStore().currSceneId = evt.target.value
          break
        }
        case "actor": {
          useWorldStore().currActorId = evt.target.value
          break
        }
        case "prop": {
          useWorldStore().currPropId = evt.target.value
          break
        }
        case "door": {
          useWorldStore().currDoorId = evt.target.val
          break
        }
      }
      // Finally, disable edit mode
      editMode.value = false
    } else {
      // Enable edit mode
      editMode.value = true
    }
  }
</script>
