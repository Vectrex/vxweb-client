<script setup>
  import SimpleTree from "@/components/vx-vue/simple-tree.vue"
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  import { urlQueryCreate } from '@/util/url-query'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['fetch-error'])
  const root = ref({})
  let resolve = null
  const doFetch = vxFetch(emit)
  const open = async (route, currentFolder) => {
    root.value = (await doFetch(urlQueryCreate(route, { folder: currentFolder })).json()).data.value || {}
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
          <simple-tree :branch="root" @branch-selected="resolve($event)" />
        </div>
      </div>
    </div>
  </div>
</template>