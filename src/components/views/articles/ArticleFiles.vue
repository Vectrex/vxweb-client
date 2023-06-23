<script setup>
  import Filemanager from "@/components/views/files/Filemanager.vue"
  import FormSwitch from "@/components/vx-vue/form-switch.vue"
  import { PencilSquareIcon, TrashIcon, DocumentMinusIcon, PlayIcon, DocumentPlusIcon } from '@heroicons/vue/24/solid'
  import { getSort, storeSort } from "@/util/storeSort"
  import { customFetch } from "@/composables/customFetch"
  import router from "@/router"
  import { ref } from "vue"

  const props = defineProps({ articleId: [Number, String], selectedFolder: [Number, String] })
  const emit = defineEmits(['notify', 'update-linked'])
  const cols = [
    {
      label: "Dateiname",
      sortable: true,
      prop: "name",
      sortAscFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) {
          return -1;
        }
        return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      },
      sortDescFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) {
          return -1;
        }
        return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1
      }
    },
    { label: "Link", sortable: true, prop: "linked" },
    { label: "Größe", sortable: true, prop: "size" },
    { label: "Typ/Vorschau", sortable: true, prop: "type" },
    { label: "Erstellt", sortable: true, prop: "modified" },
    { label: "", prop: "action" }
  ]
  const fm = ref(null)
  const handleLink = async row => {
    const response = (await customFetch('article/' + props.articleId + '/link-file').put(JSON.stringify({ fileId: row.id })).json()).data.value
    if(response.success) {
      row.linked = response.status === 'linked'
      emit('update-linked')
    }
  }
  const handleReceivedResponse = e => {
    emit('notify', e)
    if (['uploadFiles', 'delFile', 'delFolder', 'delSelection'].indexOf(e._method) !== -1) {
      emit('update-linked')
    }
  }
  const handleFolderChange = folderId => router.push({ name: 'articleEdit', params: { id: props.articleId, section: 'files', sectionId: folderId }})
</script>
<template>
  <filemanager
    :columns="cols"
    :init-sort="getSort()"
    :request-parameters="{ articleId: articleId }"
    :folder-id="selectedFolder"
    @update:folder-id="handleFolderChange"
    @response-received="handleReceivedResponse"
    @after-sort="storeSort"
    ref="fm"
  >
    <template v-slot:linked="slotProps">
      <form-switch v-if="!slotProps.row.isFolder" :model-value="slotProps.row.linked" @update:model-value="handleLink(slotProps.row)" />
    </template>

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
