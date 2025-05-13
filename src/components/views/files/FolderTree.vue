<script setup>
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  import { SimpleTree } from "vx-vue"
  import { urlQueryCreate } from '@/util/url-query'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue";

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
  <form-dialog>
    <template #title>
      Zielordner wählen
    </template>
    <template #content>
      <div class="p-4">
        <simple-tree :branch="root" :model-value="selectedFolder" @update:model-value="resolve($event)" />
      </div>
    </template>
  </form-dialog>
</template>