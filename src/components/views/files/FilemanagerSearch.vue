<script setup>
  import Spinner from "@/components/misc/spinner.vue"
  import Modal from "@/components/vx-vue/modal.vue"
  import { Focus as vFocus } from "@/directives/focus"
  import { EllipsisHorizontalIcon, FolderIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid"
  import { urlQueryCreate } from "@/util/url-query"
  import { customFetch } from "@/composables/customFetch"
  import { ref } from "vue"

  const props = defineProps({
    isMounted: {type: Boolean, default: false},
    placeholder: {type: String, default: 'Datei/Verzeichnis suchen...'},
    minLength: {type: Number, default: 3}
  })
  const emit = defineEmits(['folder-picked'])
  const modelValue = ref("")
  const files = ref([])
  const folders = ref([])
  const busy = ref(false)
  const showDialog = ref(false)

  const handleInput = async (e) => {
      modelValue.value = e.target.value
      let term = modelValue.value.trim()
      if (term.length >= props.minLength) {
        busy.value = true
        const { data } = await customFetch(urlQueryCreate("files/search", { search: term })).json()
        files.value = data.value.files || []
        folders.value = data.value.folders || []
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
    showDialog.value = false
  }
  const pickFolder = id => {
    emit('folder-picked', id);
    handleEsc()
  }
</script>

<template>
  <teleport to="#search-input" v-if="isMounted">
    <button type="button" class="icon-link flex items-center" @click="showDialog = !showDialog"><magnifying-glass-icon class="h-5 w-5" /> Suchen...</button>
  </teleport>

  <modal :show="showDialog">
    <template #title>
      <div class="fixed flex w-full justify-between items-center bg-vxvue-500 h-16 px-4">
        <div class="flex items-center space-x-2 w-full">
          <input
              class="form-input w-1/2"
              :value="modelValue"
              :placeholder="placeholder"
              @keydown.esc="handleEsc"
              @input="handleInput"
              @focus="handleInput"
              v-focus
          />
          <spinner class="h-5 w-5 text-vxvue" v-if="busy" />
        </div>
        <a href="#" @click.prevent="handleEsc"><x-mark-icon class="w-5 h-5 text-white"/></a>
      </div>
    </template>

    <template #default>
      <div class="pt-16">
        <div v-for="(folder, ndx) in (folders || [])" :key="folder.id" :class="['px-4 py-2', { 'bg-slate-100': ndx % 2 }]">
          <div class="flex items-center space-x-2">
            <folder-icon class="h-5 w-5" />
            <a
                :href="'#' + folder.path"
                @click.prevent="pickFolder(folder)"
            >{{ folder.name }}</a>
          </div>
        </div>
        <div class="flex justify-center py-2" v-if="files.length && folders.length">
          <ellipsis-horizontal-icon class="h-5 w-5 text-slate-700" />
        </div>
        <div v-for="(file, ndx) in (files || [])" :key="file.id" :class="['px-4 py-2', { 'bg-slate-100': ndx % 2 }]">
          <div class="flex space-x-2 items-center">
            <div class="w-1/2"><div>{{ file.name }}</div><div class="text-sm text-slate-700">{{ file.type }}</div></div>
            <div class="w-1/2 flex items-center space-x-2">
              <folder-icon class="h-5 w-5" />
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
