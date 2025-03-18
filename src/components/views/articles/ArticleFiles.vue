<script setup>
  import Filemanager from "@/components/views/files/Filemanager.vue"
  import { FormSwitch } from "vx-vue"
  import { PencilSquareIcon, TrashIcon, DocumentMinusIcon, PlayIcon, DocumentPlusIcon } from '@heroicons/vue/24/solid'
  import { getSort, storeSort } from "@/util/storeSort"
  import { vxFetch } from "@/composables/vxFetch"
  import router from "@/router"
  import { ref } from "vue"

  const props = defineProps({
    articleId: { type: [Number, String], default: null },
    electedFolder: { type: [Number, String], default: null },
  })
  const emit = defineEmits(['notify', 'update-linked', 'fetch-error'])
  const cols = [
    {
      label: "Dateiname",
      sortable: true,
      prop: "name",
      sortAscFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) {
          return -1
        }
        return a.name.toLowerCase() === b.name.toLowerCase() ? 0 : a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      },
      sortDescFunction: (a, b) => {
        if (a.isFolder && !b.isFolder) {
          return -1
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
  const doFetch = vxFetch(emit)
  const handleLink = async row => {
    const response = (await doFetch('article/' + props.articleId + '/link-file').put(JSON.stringify({ fileId: row.id })).json()).data.value || {}
    if(response.success) {
      row.linked = response.status === 'linked'
      emit('update-linked')
    }
  }
  const handleReceivedResponse = e => {
    emit('notify', e)
    if (['uploadFiles', 'delFile', 'delFolder', 'delSelection'].includes(e._method)) {
      emit('update-linked')
    }
  }
  const handleFolderChange = folderId => router.push({ name: 'articleEdit', params: { id: props.articleId, section: 'files', sectionId: folderId }})
</script>
<template>
  <filemanager
    ref="fm"
    :columns="cols"
    :init-sort="getSort()"
    :request-parameters="{ articleId: articleId }"
    :folder-id="selectedFolder"
    @update:folder-id="handleFolderChange"
    @response-received="handleReceivedResponse"
    @fetch-error="emit('fetch-error', $event)"
    @after-sort="storeSort"
  >
    <template #linked="{ row }">
      <form-switch v-if="!row.isFolder" :model-value="row.linked" @update:model-value="handleLink(row)" />
    </template>

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
