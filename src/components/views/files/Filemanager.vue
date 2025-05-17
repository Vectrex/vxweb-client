<script setup>
  import FileEditForm from '@/components/views/files/FileEditForm.vue'
  import FolderEditForm from '@/components/views/files/FolderEditForm.vue'
  import FilemanagerActions from '@/components/views/files/FilemanagerActions.vue'
  import FilemanagerAdd from '@/components/views/files/FilemanagerAdd.vue'
  import FilemanagerBreadcrumbs from '@/components/views/files/FilemanagerBreadcrumbs.vue'
  import FilemanagerSearch from '@/components/views/files/FilemanagerSearch.vue'
  import FolderTree from '@/components/views/files/FolderTree.vue'
  import { Confirm, Sortable, VFocus } from 'vx-vue'
  import { PencilSquareIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/solid'
  import { urlQueryCreate } from '@/util/url-query'
  import { formatFilesize } from '@/composables/formatFilesize'
  import { vxFetch } from '@/composables/vxFetch'
  import { promisedXhr } from '@/util/promisedXhr'
  import router from '@/router'
  import {computed, nextTick, ref, watch } from 'vue'

  const emit = defineEmits(['response-received', 'after-sort', 'update:folder-id', 'fetch-error'])
  const props = defineProps({
      columns: { type: Array, required: true },
      folderId: { type: [Number, String], default: '' },
      initSort: { type: Object, default: () => ({}) },
      requestParameters: { type: Object, default: () => ({}) },
      isModal: Boolean
  })
  const limits = ref({})
  const currentFolderId = ref(null)
  const parentId = ref(null)
  const files = ref([])
  const folders = ref([])
  const breadcrumbs = ref([])
  const toRename = ref(null)
  const showAddActivities = ref(false)
  const indicateDrag = ref(false)
  const formShown = ref( null)
  const pickedId = ref(null)
  const upload = ref({ files: [], progressing: false, cancelToken: {} })
  const progress = ref({ total: null, loaded: null, file: null })

  const deleteRequest = ref(null)
  const alert = ref(null)
  const multiCheckbox = ref(null)
  const folderTree = ref(null)

  const directoryEntries = computed(() => {
    folders.value.forEach(item => { item.isFolder = true; item.key = 'd' + item.id })
    files.value.forEach(item => item.key = item.id)
    return [...folders.value, ...files.value]
  })
  const checkedFiles = computed(() => files.value.filter(({ checked }) => checked))
  const checkedFolders = computed(() => folders.value.filter(({ checked }) => checked))
  const multiCheckValue = computed(() => !(checkedFiles.value.length + checkedFolders.value.length) ? false : (checkedFiles.value.length + checkedFolders.value.length === files.value.length + folders.value.length) ? true : undefined)

  const doFetch = vxFetch(emit)
  const readFolder = async () => {
    const response = (await doFetch(urlQueryCreate('folder/' + (props.folderId || '-') + '/read', props.requestParameters)).json()).data.value || {}
    if (response.success) {
      parentId.value = response.parendId
      files.value = response.files || []
      folders.value = response.folders || []
      currentFolderId.value = response.currentFolder?.key || null
      breadcrumbs.value = response.breadcrumbs || breadcrumbs.value
      limits.value = response.limits || limits.value
    }
  }
  const delSelection = async () => {
    const response = (await doFetch(urlQueryCreate('filesfolders/delete', {
      files: checkedFiles.value.map(({id}) => id).join(","),
      folders: checkedFolders.value.map(({id}) => id).join(","),
      ...props.requestParameters
    })).delete().json()).data.value || {}

    if (response.success) {
      files.value = response.files || []
      folders.value = response.folders || []
    } else if (response.error) {
      files.value = response.files || files.value
      folders.value = response.folders || folders.value
    }
    emit('response-received', {...response, _method: 'delSelection' })
  }
  const moveSelection = () => {
    formShown.value = 'folderTree'
    nextTick(
        async () => {
          const folder = await folderTree.value.open(urlQueryCreate('folders/tree', props.requestParameters), currentFolderId.value)
          formShown.value = null
          if (folder !== false) {
            const response = (await doFetch(urlQueryCreate('filesfolders/moveto/' + folder.id , props.requestParameters)).put(JSON.stringify({
              files: checkedFiles.value.map(({ id }) => id),
              folders: checkedFolders.value.map(({ id }) => id)
            })).json()).data.value || {}

            if (response.success) {
              files.value = response.files || []
              folders.value = response.folders || []
            } else if (response.error) {
              files.value = response.files || files.value
              folders.value = response.folders || folders.value
            }
            emit('response-received', {...response, _method: 'moveSelection' })
          }
        }
    )
  }
  const editFile = row => { formShown.value = 'editFile'; pickedId.value = row.id }
  const editFolder = row => { formShown.value = 'editFolder'; pickedId.value = row.id }
  const delFile = row => {
    deleteRequest.value.open('Datei löschen', `'${row.name}' wirklich löschen?`).then(async () => {
        const response = (await doFetch(urlQueryCreate('file/' + row.id, props.requestParameters)).delete().json()).data.value || {}
        if (response.success) {
          files.value.splice(files.value.findIndex(item => row === item), 1)
        }
        emit('response-received', {...response, _method: 'delFile' })
      }).catch(() => {})
  }
  const delFolder = row => {
    deleteRequest.value.open('Verzeichnis löschen', `'${row.name}' und enthaltene Dateien wirklich löschen?`).then(async () => {
      const response = (await doFetch(urlQueryCreate('folder/' + row.id, props.requestParameters)).delete().json()).data.value || {}
      if (response.success) {
        folders.value.splice(folders.value.findIndex(item => row === item), 1)
      }
      emit('response-received', {...response, _method: 'delFolder' })
    }).catch(() => {})
  }
  const rename = async (e, type) => {
    let name = e.target.value.trim()
    if (name && toRename.value) {
      const response = (await doFetch(urlQueryCreate(type + '/' + toRename.value.id + '/rename', props.requestParameters)).put(JSON.stringify({ name: name })).json()).data.value || {}
      if (response.success) {
        toRename.value.name = response.name || name
        toRename.value = null
      }
    }
  }
  const createFolder = async name => {
    showAddActivities.value = false
    const response = (await doFetch(urlQueryCreate('folder', props.requestParameters)).post(JSON.stringify({ name: name, parent: currentFolderId.value })).json()).data.value || {}
    if (response.folder) {
      folders.value.push(response.folder)
    }
    emit('response-received', {...response, _method: 'createFolder' })
  }
  const moveFile = row => {
    formShown.value = 'folderTree'
    nextTick(
        async () => {
          let folder = await folderTree.value.open(urlQueryCreate('folders/tree', props.requestParameters), currentFolderId.value)
          formShown.value = null
          if (folder !== false) {
            const response = (await doFetch(urlQueryCreate('file/' + row.id + '/move', props.requestParameters)).put(JSON.stringify({ folderId: folder.id })).json()).data.value || {}
            if (response.success) {
              files.value.splice(files.value.findIndex(item => row === item), 1)
            }
            emit('response-received', {...response, _method: 'moveFile' })
          }
        }
    )
  }
  const handleUploads = async () => {
    let file = null, response = null

    while ((file = upload.value.files.shift()) !== undefined) {
      if (limits.value.maxUploadSize && limits.value.maxUploadSize < file.f.size) {
        await alert.value.open('Datei zu groß', "'" + file.f.name + "' übersteigt die maximale Uploadgröße.")
        continue
      }
      progress.value.file = file.f.name
      try {
        response = await promisedXhr(
            urlQueryCreate("file?folder=" + file.folderId, props.requestParameters),
            'POST',
            {
              'Content-type': file.f.ftype || 'application/octet-stream',
              'X-File-Name': file.f.name.replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c)),
              'X-File-Size': file.f.size,
              'X-File-Type': file.f.type
            },
            file.f,
            null,
            e => {
              progress.value.total = e.total
              progress.value.loaded = e.loaded
            },
            upload.value.cancelToken
        )
        if (response.status >= 400) {
          await router.replace({ name: 'login' })
        }
        else if(response.files && currentFolderId.value === file.folderId) {
          files.value = response.files
        }
      } catch (err) {
        upload.value.files = []
        upload.value.progressing = false
        return
      }
      if (!response.success) {
        emit('response-received', {...response, _method: 'uploadFiles' })
        upload.value.files = []
        upload.value.progressing = false
        return
      }
    }
    upload.value.progressing = false
    if (response) {
      emit('response-received', { success: true, message: response.message || 'File upload successful', _method: 'uploadFiles' })
    }
  }
  const uploadDraggedFiles = e  => {
    indicateDrag.value = false
    uploadInputFiles(e.dataTransfer.files || [])
  }
  const uploadInputFiles = files => {
    showAddActivities.value = false
    Array.from(files).forEach(file => upload.value.files.push({ f: file, folderId: currentFolderId.value }))
    if (!upload.value.progressing) {
      upload.value.progressing = true
      progress.value.loaded = 0
      handleUploads()
    }
  }
  const cancelUpload = () => {
    if (upload.value.cancelToken.cancel) {
      upload.value.cancelToken.cancel()
      upload.value.cancelToken = {}
    }
  }

  watch(() => props.folderId,  v => { readFolder(v); currentFolderId.value = v }, { immediate: true })

  defineExpose({ delFile, delFolder, editFile, editFolder, moveFile })
</script>

<template>
  <div
    v-cloak
    :class="{'border-2 border-dotted border-vxvue-alt -m-[2px]': indicateDrag }"
    @drop.prevent.stop="uploadDraggedFiles"
    @dragover.prevent.stop="indicateDrag = true"
    @dragleave.prevent.stop="indicateDrag = false"
  >
    <div class="flex items-center pb-4 space-x-4 h-16">
      <div class="flex items-center space-x-4">
        <filemanager-breadcrumbs
          :breadcrumbs="breadcrumbs"
          :current-folder="currentFolderId"
          :folders="folders"
          @breadcrumb-clicked="emit('update:folder-id', $event.id)"
        />
        <div class="relative">
          <button
            class="icon-link text-vxvue-700! border-transparent !hover:border-vxvue-700"
            @click.stop="showAddActivities = !showAddActivities"
          >
            <plus-icon class="size-5" />
          </button>
          <transition name="appear">
            <filemanager-add
              v-if="showAddActivities"
              @upload="uploadInputFiles"
              @create-folder="createFolder"
              @close="showAddActivities = false"
            />
          </transition>
        </div>
        <filemanager-actions
          v-if="checkedFolders.length || checkedFiles.length"
          :files="checkedFiles"
          :folders="checkedFolders"
          @delete-selection="delSelection"
          @move-selection="moveSelection"
        />
      </div>

      <div class="flex justify-center py-4 px-8 w-full rounded-r rounded-l bg-slate-200">
        <div v-if="upload.progressing" class="flex items-center space-x-2">
          <button class="icon-link" @click="cancelUpload">
            <x-mark-icon class="size-5" />
          </button>
          <div class="flex flex-col items-center space-y-2">
            <div class="text-sm">
              {{ progress.file }}
            </div>
            <div class="w-64 h-2 rounded-full bg-slate-200">
              <div class="h-full rounded-full bg-vxvue-500" :style="{ width: (100 * progress.loaded / (progress.total || 1)) + '%' }" />
            </div>
          </div>
        </div>
        <strong v-else class="text-center text-primary d-block col-12">Dateien zum Upload hierher ziehen</strong>
      </div>

      <div v-if="!isModal" id="search-input" />
    </div>

    <div class="overflow-hidden rounded-sm ring-1 shadow-sm ring-black/5">
      <div class="overflow-x-auto">
        <sortable
          ref="sortable"
          :rows="directoryEntries"
          :columns="columns"
          :sort-prop="initSort.prop"
          :sort-direction="initSort.dir"
          @after-sort="emit('after-sort', $event)"
        >
          <template #checked-header>
            <input
              ref="multiCheckbox"
              type="checkbox"
              :checked="multiCheckValue"
              :indeterminate="multiCheckValue === undefined"
              class="form-checkbox"
              @click="[...folders, ...files].forEach(item => item.checked = $event.target.checked)"
            >
          </template>

          <template #checked="{ row }">
            <input v-model="row.checked" type="checkbox" class="form-checkbox">
          </template>

          <template #name="{ row }">
            <div class="flex items-center space-x-1 group">
              <template v-if="row.isFolder">
                <input
                  v-if="row === toRename"
                  v-focus
                  class="form-input"
                  :value="row.name"
                  @keydown.enter="rename($event, 'folder')"
                  @keydown.esc="toRename = null"
                  @blur="toRename = null"
                >
                <template v-else>
                  <a :href="'#' + row.id" class="link" @click.prevent="emit('update:folder-id', row.id)">{{ row.name }}</a>
                  <button
                    class="opacity-0 transition-opacity group-hover:opacity-100 icon-link"
                    @click="toRename = row"
                  >
                    <pencil-square-icon class="size-5" />
                  </button>
                </template>
              </template>
              <template v-else>
                <input
                  v-if="row === toRename"
                  v-focus
                  class="form-input"
                  :value="row.name"
                  @keydown.enter="rename($event, 'file')"
                  @keydown.esc="toRename = null"
                  @blur="toRename = null"
                >
                <template v-else>
                  <span class="overflow-hidden text-ellipsis">{{ row.name }}</span>
                  <button
                    class="opacity-0 transition-opacity group-hover:opacity-100 icon-link"
                    @click="toRename = row"
                  >
                    <pencil-square-icon class="size-5" />
                  </button>
                </template>
              </template>
            </div>
          </template>

          <template #size="{ row }">
            <template v-if="!row.isFolder">
              {{ formatFilesize(row.size, ',').formatted.value }}
            </template>
          </template>

          <template #type="{ row }">
            <img v-if="row.image" :src="row.src" alt="" class="thumb">
            <span v-else>{{ row.type }}</span>
          </template>

          <template v-for="(_, name) in $slots" #[name]="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </sortable>
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        v-if="formShown"
        class="fixed right-0 bottom-0 left-0 top-24 z-10 bg-white/75 backdrop-blur-xs"
        @click.stop="formShown = null"
      />
    </transition>

    <transition name="slide-from-right">
      <folder-edit-form
        v-if="formShown === 'editFolder'"
        :id="pickedId"
        class="fixed right-0 bottom-0 top-24 z-50 bg-white shadow-lg shadow-gray w-sidebar"
        @cancel="formShown = null"
        @response-received="emit('response-received', $event)"
        @fetch-error="emit('fetch-error', $event)"
      />
    </transition>

    <transition name="slide-from-right">
      <file-edit-form
        v-if="formShown === 'editFile'"
        :id="pickedId"
        class="fixed right-0 bottom-0 top-24 z-50 bg-white shadow-lg shadow-gray w-sidebar"
        @cancel="formShown = null"
        @response-received="emit('response-received', $event)"
        @fetch-error="emit('fetch-error', $event)"
      />
    </transition>

    <transition name="slide-from-right">
      <folder-tree
        v-if="formShown === 'folderTree'"
        ref="folderTree"
        class="fixed right-0 bottom-0 top-24 z-50 bg-white shadow-lg shadow-gray w-sidebar"
        @fetch-error="emit('fetch-error', $event)"
      />
    </transition>

    <confirm
      ref="deleteRequest"
      header-class="text-white bg-error"
      :buttons="[
        { label: 'Löschen!', value: true, class: 'button bg-error-700 hover:bg-error-600 focus:ring-error-600 text-white' },
        { label: 'Abbrechen', value: false, class: 'button bg-slate-300 hover:bg-slate-200 focus:ring-slate-200 text-slate-800' }
      ]"
    />
    <confirm
      ref="alert"
      header-class="text-white bg-error"
      :buttons="{ label: 'Ok!', value: true, class: 'button bg-slate-300 hover:bg-slate-200 focus:ring-slate-200 text-slate-800' }"
    />
  </teleport>

  <filemanager-search
    v-if="!isModal"
    @folder-picked="emit('update:folder-id', $event.id)"
    @fetch-error="emit('fetch-error', $event)"
  />
</template>
