<script setup>
  import SimpleTree from "@/components/vx-vue/simple-tree/simple-tree.vue"
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  import { urlQueryCreate } from '@/util/url-query'
  import { customFetch } from "@/composables/customFetch"
  import { ref } from "vue"

  const root = ref({})
  let resolve = null
  const open = async (route, currentFolder) => {
    const { data } = await customFetch(urlQueryCreate(route, { folder: currentFolder })).json()
    root.value = data.value
    return new Promise(res => { resolve = res })
  }
  defineExpose({ open })
</script>

<template>
  <div>
    <form-title @cancel="resolve(false)" class="w-sidebar">Zielordner wählen</form-title>
    <div class="overflow-hidden h-[calc(100vh-var(--header-height))]">
      <div class="h-full overflow-y-auto">
        <div class="pt-20 px-4 pb-4">
          <simple-tree :branch="root" @branch-selected="resolve($event)" />
        </div>
      </div>
    </div>
  </div>
</template>