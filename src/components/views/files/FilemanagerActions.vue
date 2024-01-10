<script setup>
  import { DocumentMinusIcon, DocumentPlusIcon, PlayIcon, TrashIcon } from '@heroicons/vue/24/solid'
  import { getCurrentInstance } from "vue"

  const instance = getCurrentInstance()
  const props = defineProps({ files: Array, folders: Array })
  const emit = defineEmits(['delete-selection', 'move-selection'])
  const confirmDelete = () => {
    instance.parent.refs.confirm.open('Auswahl löschen', "Selektierte Dateien/Ordner wirklich löschen?").then(() => emit('delete-selection')).catch(() => {})
  }

</script>
<template>
    <div class="flex items-center space-x-2">
      <button
        class="flex items-center icon-link tooltip"
        :data-tooltip="files.length + folders.length + ' gewählte Dateien/Ordner verschieben'"
        @click="emit('move-selection')"
      >
        <document-minus-icon class="size-5"/>
        <play-icon class="w-3 h-3" />
        <document-plus-icon class="size-5"/>
      </button>
      <button
        class="icon-link tooltip"
        :data-tooltip="files.length + folders.length + ' gewählte Dateien/Ordner löschen'"
        @click="confirmDelete"
      >
        <trash-icon class="size-5" />
      </button>
    </div>
</template>