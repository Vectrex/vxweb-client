<script setup>
  import { DocumentMinusIcon, DocumentPlusIcon, PlayIcon, TrashIcon } from '@heroicons/vue/24/solid'
  import { getCurrentInstance } from "vue"

  const instance = getCurrentInstance()
  const props = defineProps({ files: Array, folders: Array })
  const emit = defineEmits(['delete-selection', 'move-selection'])
  const confirmDelete = async () => {
    if(await instance.parent.refs.confirm.open('Auswahl löschen', "Selektierte Dateien/Ordner wirklich löschen?")) {
      emit('delete-selection')
    }
  }
</script>
<template>
    <div class="flex items-center space-x-2">
      <button
        class="icon-link flex items-center tooltip"
        :data-tooltip="files.length + folders.length + ' gewählte Dateien/Ordner verschieben'"
        type="button"
        @click="emit('move-selection')"
      >
        <document-minus-icon class="h-5 w-5"/>
        <play-icon class="h-3 w-3" />
        <document-plus-icon class="h-5 w-5"/>
      </button>
      <button
        class="icon-link tooltip"
        :data-tooltip="files.length + folders.length + ' gewählte Dateien/Ordner löschen'"
        type="button"
        @click="confirmDelete"
      >
        <trash-icon class="h-5 w-5" />
      </button>
    </div>
</template>