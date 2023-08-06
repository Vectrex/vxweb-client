<script setup>
  import Filemanager from "@/components/views/files/Filemanager.vue"
  import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/solid'
  import { getSort, storeSort } from "@/util/storeSort"
  import { ref } from "vue"

  const props = defineProps({ folderId: [String, Number], onlyImages: Boolean })
  const emit = defineEmits(['notify', 'pickFile'])
  const currentFolder = ref('')
  const cols = [
    {
      label: "Dateiname",
      sortable: true,
      prop: "name",
      sortAscFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) { return -1 }
        return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      },
      sortDescFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) { return -1 }
        return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
      }
    },
    { label: "Größe", sortable: true, prop: "size" },
    { label: "Typ/Vorschau", sortable: true, prop: "type" },
    { label: "Erstellt", sortable: true, prop: "modified" },
    { label: "", prop: "action" }
  ]
</script>

<template>
  <filemanager
      :columns="cols"
      :init-sort="getSort()"
      @response-received="emit('notify', $event)"
      @after-sort="storeSort"
      :is-modal="true"
      :folder-id="currentFolder"
      @update:folder-id="currentFolder = $event"
  >
    <template v-slot:action="slotProps">
      <div class="flex items-center space-x-1 justify-end">
        <template v-if="!slotProps.row.isFolder && (!onlyImages || slotProps.row.image)">
          <button class="icon-link" @click="emit('pickFile', slotProps.row)">
            <arrow-top-right-on-square-icon class="h-5 w-5" />
          </button>
        </template>
      </div>
    </template>
  </filemanager>
</template>
