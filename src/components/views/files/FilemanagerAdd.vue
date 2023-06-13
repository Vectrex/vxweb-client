<script setup>
  import { Focus as vFocus } from "@/directives/focus"
  import { DocumentArrowUpIcon, FolderPlusIcon } from '@heroicons/vue/24/solid'
  import { ref } from "vue"

  const props = defineProps({ multiple: { type: Boolean, default: true }})
  const emit = defineEmits(['upload', 'create-folder'])
  const showAddFolderInput = ref(false)
  const fileChanged = e => {
    const files = e.target.files || e.dataTransfer.files
    if (files) {
      emit('upload', files)
    }
  }
  const addFolder = e => {
    const name = e.target.value.trim()
    if (name) {
      emit('create-folder', name)
    }
    showAddFolderInput.value = false
  }
</script>

<template>
    <input
      v-if="showAddFolderInput"
      v-focus
      class="form-input mx-4 my-2"
      @keydown.enter="addFolder"
      @keydown.esc="showAddFolderInput = false"
      @blur="showAddFolderInput = false"
      @click.stop
    />
    <button
        v-else
        type="button"
        @click.stop="showAddFolderInput = true"
        class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex space-x-1 items-center"
    >
      <folder-plus-icon class="w-5 h-5" />
      <span class="">Verzeichnis&nbsp;erstellen</span>
    </button>
    <label
      for="file_upload"
      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex space-x-1 items-center"
    >
      <document-arrow-up-icon class="w-5 h-5" />
      <span>Datei hochladen</span>
    </label>
    <input type="file" id="file_upload" class="hidden" :multiple="multiple" @change="fileChanged" />
</template>