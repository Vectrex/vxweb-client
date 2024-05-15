<script setup>
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  import { SimpleTree } from "vx-vue"
  import { urlQueryCreate } from '@/util/url-query'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['fetch-error'])
  const root = ref({})
  const selectedFolder = ref({})
  let resolve = null
  const doFetch = vxFetch(emit)

  const findBranch = (branch, id) => {
    if(branch.id === id) {
      return branch
    }
    if (branch.branches && branch.branches.length) {
      for(let i = 0, l = branch.branches.length; i < l; ++i) {
        let found = findBranch(branch.branches[i], id)
        if (found) {
          return found
        }
      }
    }
  }
  const open = async (route, currentFolder) => {
    root.value = (await doFetch(urlQueryCreate(route, { folder: currentFolder })).json()).data.value || {}
    selectedFolder.value = findBranch(root.value, currentFolder)
    return new Promise(res => { resolve = res })
  }
  defineExpose({ open })
</script>

<template>
  <div>
    <form-title @cancel="resolve(false)" class="w-sidebar">Zielordner wählen</form-title>
    <div class="overflow-hidden h-[calc(100vh-var(--header-height))]">
      <div class="overflow-y-auto h-full">
        <div class="px-4 pt-20 pb-4">
          <simple-tree :branch="root" @update:modelValue="resolve($event)" :model-value="selectedFolder" />
        </div>
      </div>
    </div>
  </div>
</template>