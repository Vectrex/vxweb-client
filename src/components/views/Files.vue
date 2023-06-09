<script setup>
  import Headline from "@/components/app/Headline.vue"
  import Filemanager from "@/components/views/files/Filemanager.vue"
  import { PencilSquareIcon, DocumentMinusIcon, DocumentPlusIcon, PlayIcon, TrashIcon } from '@heroicons/vue/24/solid'
  import { getSort, storeSort } from "@/util/storeSort"
  import router from "@/router"
  import { ref } from "vue"

  const props = defineProps({ folderId: [String, Number] })
  const emit = defineEmits(['notify'])
  const fm = ref(null)
  const cols = [
    {
      label: "",
      prop: "checked"
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
  <teleport to="#tools">
    <headline>Dateien</headline>
  </teleport>

  <filemanager
    :columns="cols"
    :init-sort="getSort()"
    :folder-id="folderId"
    @update:folder-id="router.push({ name: 'files', params: { folderId: $event } })"
    @response-received="emit('notify', $event)"
    @after-sort="storeSort"
    ref="fm"
  >
    <template v-slot:action="slotProps">
      <div class="flex items-center space-x-1 justify-end">
        <template v-if="slotProps.row.isFolder">
          <button class="icon-link tooltip" data-tooltip="Bearbeiten" type="button" @click="fm.editFolder(slotProps.row)">
            <pencil-square-icon class="h-5 w-5" />
          </button>
          <button class="icon-link tooltip" data-tooltip="leeren &amp; löschen" @click="fm.delFolder(slotProps.row)">
            <trash-icon class="h-5 w-5" />
          </button>
        </template>
        <template v-else>
          <button class="icon-link tooltip" data-tooltip="Bearbeiten" type="button" @click="fm.editFile(slotProps.row)">
            <pencil-square-icon class="h-5 w-5" />
          </button>
          <button class="icon-link flex items-center tooltip" data-tooltip="Verschieben" type="button" @click="fm.moveFile(slotProps.row)">
            <document-minus-icon class="h-5 w-5"/>
            <play-icon class="h-3 w-3" />
            <document-plus-icon class="h-5 w-5"/>
          </button>
          <button class="icon-link tooltip" data-tooltip="Löschen" type="button" @click="fm.delFile(slotProps.row)">
            <trash-icon class="h-5 w-5" />
          </button>
        </template>
      </div>
    </template>
  </filemanager>
</template>