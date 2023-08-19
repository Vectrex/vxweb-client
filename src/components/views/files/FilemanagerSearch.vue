<script setup>
  import Spinner from "@/components/misc/spinner.vue"
  import Modal from "@/components/vx-vue/modal.vue"
  import { Focus as vFocus } from "@/directives/focus"
  import { EllipsisHorizontalIcon, FolderIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid"
  import { urlQueryCreate } from "@/util/url-query"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['folder-picked','fetch-error'])
  const props = defineProps({
    isMounted: Boolean,
    placeholder: { type: String, default: 'Datei/Verzeichnis suchen...' },
    minLength: { type: Number, default: 3 }
  })
  const modelValue = ref("")
  const files = ref([])
  const folders = ref([])
  const busy = ref(false)
  const showSearch = ref(false)
  const doFetch = vxFetch(emit)

  const handleInput = async e => {
      modelValue.value = e.target.value
      let term = modelValue.value.trim()
      if (term.length >= props.minLength) {
        busy.value = true
        const response = (await doFetch(urlQueryCreate("files/search", { search: term })).json()).data.value || {}
        files.value = response.files || []
        folders.value = response.folders || []
        busy.value = false
      }
      else {
        files.value = []
        folders.value = []
      }
    }
  const handleEsc = ()  => {
    modelValue.value = ""
    files.value = []
    folders.value = []
    showSearch.value = false
  }
  const pickFolder = id => {
    emit('folder-picked', id)
    handleEsc()
  }
</script>

<template>
  <teleport to="#search-input" v-if="isMounted">
    <button class="flex items-center icon-link" @click="showSearch = !showSearch"><magnifying-glass-icon class="w-5 h-5" /> Suchen...</button>
  </teleport>

  <modal :show="showSearch">
    <template #title>
      <div class="flex fixed justify-between items-center px-4 w-full h-16 bg-vxvue-500">
        <div class="flex items-center space-x-2 w-full">
          <input
              class="w-1/2 form-input"
              :value="modelValue"
              :placeholder="placeholder"
              @keydown.esc="handleEsc"
              @input="handleInput"
              @focus="handleInput"
              v-focus
          />
          <spinner class="w-5 h-5 text-vxvue" v-if="busy" />
        </div>
        <a href="#" @click.prevent="handleEsc"><x-mark-icon class="w-5 h-5 text-white"/></a>
      </div>
    </template>

    <template #default>
      <div class="pt-16">
        <div v-for="(folder, ndx) in (folders || [])" :key="folder.id" :class="['px-4 py-2', { 'bg-slate-100': ndx % 2 }]">
          <div class="flex items-center space-x-2">
            <folder-icon class="w-5 h-5" />
            <a
                :href="'#' + folder.path"
                @click.prevent="pickFolder(folder)"
            >{{ folder.name }}</a>
          </div>
        </div>
        <div class="flex justify-center py-2" v-if="files.length && folders.length">
          <ellipsis-horizontal-icon class="w-5 h-5 text-slate-700" />
        </div>
        <div v-for="(file, ndx) in (files || [])" :key="file.id" :class="['px-4 py-2', { 'bg-slate-100': ndx % 2 }]">
          <div class="flex items-center space-x-2">
            <div class="w-1/2"><div>{{ file.name }}</div><div class="text-sm text-slate-700">{{ file.type }}</div></div>
            <div class="flex items-center space-x-2 w-1/2">
              <folder-icon class="w-5 h-5" />
              <a
                  :href="'/' + file.folder.path"
                  @click.prevent="pickFolder(file.folder)"
              >{{ file.folder.path }}</a>
            </div>
          </div>

        </div>
      </div>
    </template>
  </modal>
</template>
