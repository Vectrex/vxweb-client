<script setup>
  import { VFocus } from "vx-vue"
  import { DocumentArrowUpIcon, FolderPlusIcon } from '@heroicons/vue/24/solid'
  import { onClickOutside } from "@vueuse/core"
  import { ref } from "vue"

  const props = defineProps({ multiple: { type: Boolean, default: true }})
  const emit = defineEmits(['upload', 'create-folder', 'close'])
  const showAddFolderInput = ref(false)
  const container = ref(null)
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
  onClickOutside(container, () => emit('close'))
</script>

<template>
  <div
    ref="container"
    class="absolute left-0 z-10 py-1 mt-2 bg-white rounded-sm ring-1 ring-black/5 shadow-lg origin-top-right focus:outline-hidden"
    role="menu"
    aria-orientation="vertical"
  >
    <input
      v-if="showAddFolderInput"
      v-focus
      class="my-2 mx-4 form-input"
      @keydown.enter="addFolder"
      @keydown.esc="showAddFolderInput = false"
      @blur="showAddFolderInput = false"
      @click.stop
    >
    <button
      v-else
      class="flex items-center py-2 px-4 space-x-1 text-sm text-gray-700 hover:bg-gray-100"
      @click.stop="showAddFolderInput = true"
    >
      <folder-plus-icon class="size-5" />
      <span class="">Verzeichnis&nbsp;erstellen</span>
    </button>
    <label
      for="file_upload"
      class="flex items-center py-2 px-4 space-x-1 text-sm text-gray-700 hover:bg-gray-100"
    >
      <document-arrow-up-icon class="size-5" />
      <span>Datei hochladen</span>
    </label>
    <input
      id="file_upload"
      type="file"
      class="hidden"
      :multiple="multiple"
      @change="fileChanged"
    >
  </div>
</template>