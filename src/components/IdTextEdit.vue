<template>
  <v-form v-model="isFormValid">
  <v-row v-if="isEditing" align="center" class="mb-2">
    <v-col>
      <v-text-field 
        id="txtId"
        v-model="localValue" 
        :rules="[rules.required, rules.unique, rules.noSpaces]"
        :label="label"
        @keydown.enter="save" 
        @keydown.esc="cancel" />
    </v-col>
    <v-col cols="4">
        <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-floppy'
        @click="save"
        :disabled="!isFormValid"
      ></v-btn>
      <v-btn
        density="comfortable"
        variant="tonal"
        color="info"
        icon='mdi-cancel'
        @click="cancel"
      ></v-btn>
    </v-col>
  </v-row>
  <v-row v-else align="center" class="mb-2">
    <v-col>
      <v-text-field 
        v-model="model" 
        :label="label" 
        :disabled=true 
        hide-details />
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
  </v-form>
</template>

<script setup lang="ts">
  //console.log(">>> Creating IdTextEdit...")
  
  import { SAGEdit } from "@/pixi-sagedit/SAGEdit";
  import { useWorldStore } from "@/stores/WorldStore"
  import { onMounted, ref } from "vue"

  onMounted(() => {
    //debugger
    // Listen for selection changes
    SAGEdit?.Events?.on("selectionChanged", (selectedId: string) => {
        // Cancel any ID edits, as likely lost focus for item we were editing
        cancel()
      },
      this
    )
  })

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
  const isFormValid = ref(false)

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
    noSpaces: value => !/\s/.test(value) || 'ID cannot contain spaces',
  }

  // Start editing
  function startEditing() {
    localValue.value = model.value  // copy model into local editable value
    isEditing.value = true
  }

  // Save changes
  function save() {
    if (!isFormValid.value){
      console.error("Abort save as form is invalid")
      return;
    }

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
