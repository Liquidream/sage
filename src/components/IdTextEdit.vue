<template>
  <v-row align="center" class="mb-2">
    <v-col>
      <v-text-field
        :label="label"
        v-model="wipModel"
        :disabled="!editMode"
        dirty
        hide-details
        @keydown.enter="editSaveClicked"
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
  console.log(">>> Creating IdTextEdit...")
  
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit";
//import { useSceneStore } from "@/stores/SceneStore";
import { useWorldStore } from "@/stores/WorldStore"
  import { ref } from "vue"

  const model = defineModel({ type: String })
  const props = defineProps({
    label: String,
    type: String,
  })
  const wipModel = ref(model.value)
  const editMode = ref(false)

  const wipModelUpdated = (evt) => {
    console.log(">>> wipModel edited, so keep it 'current'")
    console.debug(evt)
    wipModel.value = evt.target.value
    //useWorldStore().currActorId = evt.target.value
  }

  // When save clicked,
  //  - Check ID name is valid (unique)
  //  - Update value, but ensure current selection maintained
  const editSaveClicked = (evt) => {
    if (editMode.value) {
      // Save clicked
      console.log(">>> wip text done, so save to model")
      // Remember prev value (as could be useful later)
      const oldValue = model.value
      //
      model.value = wipModel.value

      // Maintain current selection by keeping curr ID in sync
      switch (props.type) {
        case "sequence": {
          // Realign "orphaned" child objects in scene
          // (now sequence id has been renamed)
          SAGEdit.Events.emit("sequenceIdRenamed", oldValue, wipModel.value)
          useWorldStore().currSequenceId = wipModel.value
          break
        }
        case "scene": {
          // Realign "orphaned" child objects in scene
          // (now scene id has been renamed)
          SAGEdit.Events.emit("sceneIdRenamed", oldValue, wipModel.value)
          //useSceneStore().realignChildObjects(oldValue, wipModel.value)
          useWorldStore().currSceneId = wipModel.value
          break
        }
        case "actor": {
          useWorldStore().currActorId = wipModel.value
          break
        }
        case "prop": {
          useWorldStore().currPropId = wipModel.value
          break
        }
        case "door": {
          useWorldStore().currDoorId = wipModel.value
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
