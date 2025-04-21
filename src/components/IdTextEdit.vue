<template>
  <!-- V2  -->
  <v-row v-if="isEditing" align="center" class="mb-2">
    <v-col>
      <v-text-field v-model="localValue" />
    </v-col>
    <v-col cols="2">
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
      ></v-btn>
      <!-- <v-btn @click="save">Save</v-btn>
      <v-btn @click="cancel">Cancel</v-btn> -->
    </v-col>
  </v-row>
  <v-row v-else align="center" class="mb-2">
    <v-col>
      <v-text-field v-model="model" disabled=true />
      <!-- <span>{{ model }}</span> -->
    </v-col> 
    <v-col cols="2">
    <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-rename'
        @click="startEditing"
      ></v-btn>
      <!-- <v-btn @click="startEditing">Edit</v-btn> -->
    </v-col>
  </v-row>

  <!-- V1  -->
  <!-- <v-row align="center" class="mb-2">
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
  </v-row> -->
</template>

<script setup lang="ts">
  console.log(">>> Creating IdTextEdit...")
  
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit";
  import { useWorldStore } from "@/stores/WorldStore"
  import { ref } from "vue"


// - v2 ----------------------------------------------------------------

const model = defineModel()  // this is the v-model binding

const props = defineProps({  // This is for extra props
  type: {
    type: String,
    default: 'text'
  }
})

const isEditing = ref(false)
const localValue = ref('')

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
          //useSceneStore().realignChildObjects(oldValue, wipModel.value)
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

// - v1 ----------------------------------------------------------------
/*
  const model = defineModel()
  //const model = defineModel({ type: String })
  const props = defineProps({
    label: String,
    type: String,
  })
  const wipModel = ref(model.value)
  console.log(`>>> model.value = ${model.value}`)
  const editMode = ref(false)

  const wipModelUpdated = (evt) => {
    console.log(">>> wipModel edited, so keep it 'current'")
    console.debug(evt)
    wipModel.value = evt.target.value
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
*/

</script>
