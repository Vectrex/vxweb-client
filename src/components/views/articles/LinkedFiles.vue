<script setup>
  import { SlickList, SlickItem, DragHandle } from 'vue-slicksort'
  import { EyeIcon, EyeSlashIcon, LinkIcon, Bars4Icon } from '@heroicons/vue/24/solid'
  import { vxFetch } from '@/composables/useVxFetch'
  import { fetchJson } from '@/util/fetchJson'
  import { ref, onMounted } from 'vue'

  const emit = defineEmits(['update-linked', 'goto-folder', 'fetch-error'])
  const props = defineProps({ articleId: { type: [Number, String], required: true }})
  const linkedFiles = ref([])
  const saveSort = async () => {
    let ids = []
    linkedFiles.value.forEach(f => ids.push(f.id))
    try {
      await fetchJson(vxFetch('article/' + props.articleId + '/linked-files').put({ fileIds: ids }))
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  const unlink = async file => {
    try {
      const response = await fetchJson(vxFetch('article/' + props.articleId + '/link-file').put({ fileId: file.id })) || {}
      if(response.success) {
        linkedFiles.value.splice(linkedFiles.value.findIndex(item => item === file), 1)
        emit('update-linked')
      }
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  const toggleVisibility = async file => {
    try {
      const response = await fetchJson(vxFetch('article/' + props.articleId + '/toggle-linked-file').put({ fileId: file.id })) || {}
      if(response.success) {
        file.hidden = !!response.hidden
      }
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  onMounted(async () => {
    try {
      linkedFiles.value = await fetchJson(vxFetch('article/' + props.articleId + '/linked-files')) || {}
    } catch (error) {
      emit('fetch-error', error)
    }
  })
</script>

<template>
  <slick-list v-model:list="linkedFiles" lock-axis="y" use-drag-handle @update:list="saveSort">
    <slick-item v-for="(item, ndx) in linkedFiles" :key="item.id" :index="ndx" class="flex items-center py-2 space-x-4 w-full border-b last:border-none">
      <drag-handle class="cursor-pointer">
        <bars4-icon class="size-5" />
      </drag-handle>
      <div :class="['w-1/4', { 'text-slate-400': item.hidden }]">
        {{ item.filename }}
      </div>
      <div class="flex justify-center items-center w-24">
        <img v-if="item.isThumb && item.src" :src="item.src" alt="" class="thumb">
        <div v-else class="overflow-hidden whitespace-nowrap text-ellipsis">
          {{ item.type }}
        </div>
      </div>
      <div class="flex justify-center items-center space-x-2 w-24">
        <button class="icon-link" @click="unlink(item)">
          <link-icon class="size-5" />
        </button>
        <button class="icon-link" @click="toggleVisibility(item)">
          <component :is="item.hidden ? EyeIcon : EyeSlashIcon" class="size-5" />
        </button>
      </div>
      <a class="w-1/2" :href="'#'+ item.folder.path" @click.prevent="emit('goto-folder', item.folder)">{{ item.folder.path }}</a>
    </slick-item>
  </slick-list>
</template>