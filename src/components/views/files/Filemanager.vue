<script setup>
  import Sortable from "@/components/vx-vue/sortable.vue"
  import FileEditForm from "@/components/views/files/FileEditForm.vue"
  import FolderEditForm from "@/components/views/files/FolderEditForm.vue"
  import FilemanagerActions from "@/components/views/files/FilemanagerActions.vue"
  import FilemanagerAdd from "@/components/views/files/FilemanagerAdd.vue"
  import FilemanagerBreadcrumbs from "@/components/views/files/FilemanagerBreadcrumbs.vue"
  import FilemanagerSearch from "@/components/views/files/FilemanagerSearch.vue"
  import FolderTree from "@/components/views/files/FolderTree.vue"
  import Alert from "@/components/vx-vue/alert.vue"
  import { PencilSquareIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/solid'
  import { urlQueryCreate } from '@/util/url-query'
  import { formatFilesize } from "@/util/format-filesize"
  import { Focus as vFocus } from "@/directives/focus"
  import { customFetch } from "@/composables/customFetch"
  import { promisedXhr } from "@/util/promisedXhr"
  import router from "@/router"
  import {ref, onMounted, watch, computed, nextTick} from "vue"

  const emit = defineEmits(['response-received', 'after-sort', 'update:folder-id'])
  const props = defineProps({
      columns: {type: Array, required: true},
      folderId: {type: [Number, String], default: ''},
      initSort: Object,
      requestParameters: {type: Object, default: {}}
  })
  const isMounted = ref(false)
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

  const confirm = ref(null)
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
  const readFolder = async () => {
    const response = (await customFetch(urlQueryCreate('folder/' + (props.folderId || '-') + '/read', props.requestParameters)).json()).data.value || {}
    if (response.success) {
      parentId.value = response.parendId
      files.value = response.files || []
      folders.value = response.folders || []
      currentFolderId.value = response.currentFolder?.key || null
      breadcrumbs.value = response.breadcrumbs || breadcrumbs.value
      limits.value = response.limits || limits.value
    }
  }
  const setMultiCheckbox = itemCount => {
    if (multiCheckbox.value) {
      if (itemCount) {
        multiCheckbox.value.checked = false
      }
      multiCheckbox.value.indeterminate = itemCount && itemCount !== files.value.length + folders.value.length
    }
  }
  const delSelection = async () => {
    const response = (await customFetch(urlQueryCreate('filesfolders/delete', {
      files: checkedFiles.value.map(({id}) => id).join(","),
      folders: checkedFolders.valu.map(({id}) => id).join(","),
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
            const response = (await customFetch(urlQueryCreate('filesfolders/moveto/' + folder.id , props.requestParameters)).put(JSON.stringify({
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
  const delFile = async row => {
    if (await confirm.value.open('Datei löschen', "'" + row.name + "' wirklich löschen?")) {
      const response = (await customFetch(urlQueryCreate('file/' + row.id, props.requestParameters)).delete().json()).data.value || {}
      if (response.success) {
        files.value.splice(files.value.findIndex(item => row === item), 1)
      }
      emit('response-received', {...response, _method: 'delFile' })
    }
  }
  const rename = async (e, type) => {
    let name = e.target.value.trim()
    if (name && toRename.value) {
      const response = (await customFetch(urlQueryCreate(type + '/' + toRename.value.id + '/rename', props.requestParameters)).put(JSON.stringify({ name: name })).json()).data.value || {}
      if (response.success) {
        toRename.value.name = response.name || name
        toRename.value = null
      }
    }
  }
  const delFolder = async row => {
    if (await confirm.value.open('Verzeichnis löschen', "'" + row.name + "' und enthaltene Dateien wirklich löschen?")) {
      const response = (await customFetch(urlQueryCreate('folder/' + row.id, props.requestParameters)).delete().json()).data.value || {}
      if (response.success) {
        folders.value.splice(folders.value.findIndex(item => row === item), 1)
      }
      emit('response-received', {...response, _method: 'delFolder' })
    }
  }
  const createFolder = async name => {
    showAddActivities.value = false
    const response = (await customFetch(urlQueryCreate('folder', props.requestParameters)).post(JSON.stringify({ name: name, parent: currentFolderId.value })).json()).data.value || {}
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
            const response = (await customFetch(urlQueryCreate('file/' + row.id + '/move', props.requestParameters)).put(JSON.stringify({ folderId: folder.id })).json()).data.value || {}
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
      if (limits.value.maxUploadSize && limits.value.maxUploadSize < file.size) {
        await alert.value.open('Datei zu groß', "'" + file.name + "' übersteigt die maximale Uploadgröße.")
        continue
      }
      progress.value.file = file.name
      try {
        response = await promisedXhr(
            urlQueryCreate("file?folder=" + currentFolderId.value, props.requestParameters),
            'POST',
            {
              'Content-type': file.type || 'application/octet-stream',
              'X-File-Name': file.name.replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c)),
              'X-File-Size': file.size,
              'X-File-Type': file.type
            },
            file,
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
        else if(response.files) {
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
  const uploadDraggedFiles = e  => { indicateDrag.value = false; uploadInputFiles(e.dataTransfer.files || []) }
  const uploadInputFiles = files => {
    showAddActivities.value = false
    upload.value.files.push(...files)
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

  onMounted(() => isMounted.value = true)
  watch(() => props.folderId,  v => { readFolder(v); currentFolderId.value = v }, { immediate: true })
  watch(checkedFiles, v => setMultiCheckbox(checkedFolders.value.length + v.length))
  watch(checkedFolders, v => setMultiCheckbox(checkedFiles.value.length + v.length))

  defineExpose({ delFile, delFolder, editFile, editFolder, moveFile })
</script>

<template>
  <div
      v-cloak
      @drop.prevent.stop="uploadDraggedFiles"
      @dragover.prevent.stop="indicateDrag = true"
      @dragleave.prevent.stop="indicateDrag = false"
      :class="{'border-2 border-dotted border-vxvue-alt -m-[2px]': indicateDrag }"
  >
    <div class="flex pb-4 justify-between items-center h-16">
      <div class="flex items-center space-x-4">
        <filemanager-breadcrumbs
            :breadcrumbs="breadcrumbs"
            :current-folder="currentFolderId"
            :folders="folders"
            @breadcrumb-clicked="$emit('update:folder-id', $event.id)"
        />
        <div class="relative">
          <button
              class="icon-link !text-vxvue-700 border-transparent !hover:border-vxvue-700"
              type="button"
              href="#" @click.stop="showAddActivities = !showAddActivities"
          >
            <plus-icon class="w-5 h-5" />
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
            @delete-selection="delSelection"
            @move-selection="moveSelection"
            :files="checkedFiles"
            :folders="checkedFolders"
            v-if="checkedFolders.length || checkedFiles.length"
        />
      </div>

      <div class="bg-slate-200 px-8 py-4 w-1/4 flex justify-center rounded-l rounded-r">
        <div class="flex space-x-2 items-center" v-if="upload.progressing">
          <button class="icon-link" data-tooltip="Abbrechen" type="button" @click="cancelUpload"><x-mark-icon class="h-5 w-5" /></button>
          <div class="flex flex-col items-center space-y-2">
            <div class="text-sm">{{ progress.file }}</div>
            <div class="w-64 bg-slate-200 rounded-full h-2">
              <div class="bg-vxvue-500 rounded-full h-full" :style="{ width: (100 * progress.loaded / (progress.total || 1)) + '%' }" />
            </div>
          </div>
        </div>
        <strong class="text-primary d-block col-12 text-center" v-else>Dateien zum Upload hierher ziehen</strong>
      </div>

      <div id="search-input" />
    </div>

    <sortable
        :rows="directoryEntries"
        :columns="columns"
        :sort-prop="initSort.prop"
        :sort-direction="initSort.dir"
        @after-sort="$emit('after-sort', $event)"
        ref="sortable"
    >

      <template v-slot:checked-header>
        <input type="checkbox"
          class="form-checkbox"
          @click="[...folders, ...files].forEach(item => item.checked = $event.target.checked)"
          ref="multiCheckbox"
        />
      </template>

      <template v-slot:checked="slotProps">
        <input type="checkbox" class="form-checkbox" v-model="slotProps.row.checked" />
      </template>

      <template v-slot:name="slotProps">
        <div class="flex items-center space-x-1 group">
          <template v-if="slotProps.row.isFolder">
            <input
                v-if="slotProps.row === toRename"
                v-focus
                class="form-input"
                :value="slotProps.row.name"
                @keydown.enter="rename($event, 'folder')"
                @keydown.esc="toRename = null"
                @blur="toRename = null"
            >
            <template v-else>
              <a :href="'#' + slotProps.row.id" @click.prevent="$emit('update:folder-id', slotProps.row.id)" class="link">{{ slotProps.row.name }}</a>
              <button
                  class="icon-link opacity-0 group-hover:opacity-100 transition-opacity tooltip"
                  data-tooltip="Umbenennen"
                  @click="toRename = slotProps.row"
              >
                <pencil-square-icon class="h-5 w-5" />
              </button>
            </template>
          </template>
          <template v-else>
            <input
                v-if="slotProps.row === toRename"
                v-focus
                class="form-input"
                :value="slotProps.row.name"
                @keydown.enter="rename($event, 'file')"
                @keydown.esc="toRename = null"
                @blur="toRename = null"
            >
            <template v-else>
              <span>{{ slotProps.row.name }}</span>
              <button
                class="icon-link opacity-0 group-hover:opacity-100 transition-opacity tooltip"
                data-tooltip="Umbenennen"
                @click="toRename = slotProps.row"
              >
                <pencil-square-icon class="h-5 w-5" />
              </button>
            </template>
          </template>
        </div>
      </template>

      <template v-slot:size="slotProps">
        <template v-if="!slotProps.row.isFolder">{{ formatFilesize(slotProps.row.size, ',') }}</template>
      </template>

      <template v-slot:type="slotProps">
        <img :src="slotProps.row.src" alt="" v-if="slotProps.row.image" class="thumb">
        <span v-else>{{ slotProps.row.type }}</span>
      </template>

      <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData"/>
      </template>

    </sortable>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        class="z-10 fixed right-0 bottom-0 top-24 left-0 bg-white/75 backdrop-blur-sm"
        v-if="formShown"
        @click.stop="formShown = null"
      />
    </transition>

    <transition name="slide-from-right">
      <folder-edit-form
        :id="pickedId"
        v-if="formShown === 'editFolder'"
        @cancel="formShown = null"
        @response-received="$emit('response-received', $event)"
        class="fixed top-24 bottom-0 shadow-gray shadow-lg bg-white w-sidebar right-0 z-50"
      />
    </transition>

    <transition name="slide-from-right">
      <file-edit-form
        :id="pickedId"
        v-if="formShown === 'editFile'"
        @cancel="formShown = null"
        @response-received="$emit('response-received', $event)"
        class="fixed top-24 bottom-0 shadow-gray shadow-lg bg-white w-sidebar right-0 z-50"
      />
    </transition>

    <transition name="slide-from-right">
      <folder-tree
        v-if="formShown === 'folderTree'"
        class="fixed top-24 bottom-0 shadow-gray shadow-lg bg-white w-sidebar right-0 z-50"
        ref="folderTree"
      />
    </transition>

    <alert
        ref="confirm"
        header-class="bg-error text-white"
        :buttons="[
            { label: 'Löschen!', value: true, 'class': 'button alert' },
            { label: 'Abbrechen', value: false, 'class': 'button cancel' }
          ]"
    />
    <alert
        ref="alert"
        header-class="bg-error text-white"
        :buttons="[
            { label: 'Ok!', value: true, 'class': 'button cancel' },
          ]"
    />
  </teleport>

  <filemanager-search @folder-picked="$emit('update:folder-id', $event.id)" :is-mounted="isMounted" />

</template>
