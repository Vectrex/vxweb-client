<script setup>
  import Headline from "@/components/app/Headline.vue"
  import Filemanager from "@/components/views/files/Filemanager.vue"
  import { PencilSquareIcon, DocumentMinusIcon, DocumentPlusIcon, PlayIcon, TrashIcon } from '@heroicons/vue/24/solid'
  import { getSort, storeSort } from "@/util/storeSort"
  import router from "@/router"
  import { ref } from "vue"

  const props = defineProps({ folderId: { type: [String, Number], default: null }})
  const emit = defineEmits(['notify', 'fetch-error'])
  const fm = ref(null)
  const cols = [
    {
      label: "",
      prop: "checked",
      cssClass: "w-6"
    },
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
  <teleport defer to="#tools">
    <headline>Dateien</headline>
  </teleport>

  <filemanager
    ref="fm"
    :columns="cols"
    :init-sort="getSort()"
    :folder-id="folderId"
    @update:folder-id="router.push({ name: 'files', params: { folderId: $event } })"
    @response-received="emit('notify', $event)"
    @fetch-error="emit('fetch-error', $event)"
    @after-sort="storeSort"
  >
    <template #action="{ row }">
      <div class="flex justify-end items-center space-x-1">
        <template v-if="row.isFolder">
          <button class="icon-link" @click="fm.editFolder(row)">
            <pencil-square-icon class="size-5" />
          </button>
          <button class="icon-link" @click="fm.delFolder(row)">
            <trash-icon class="size-5" />
          </button>
        </template>
        <template v-else>
          <button class="icon-link" @click="fm.editFile(row)">
            <pencil-square-icon class="size-5" />
          </button>
          <button class="flex items-center icon-link" @click="fm.moveFile(row)">
            <document-minus-icon class="size-5" />
            <play-icon class="w-3 h-3" />
            <document-plus-icon class="size-5" />
          </button>
          <button class="icon-link" @click="fm.delFile(row)">
            <trash-icon class="size-5" />
          </button>
        </template>
      </div>
    </template>
  </filemanager>
</template>