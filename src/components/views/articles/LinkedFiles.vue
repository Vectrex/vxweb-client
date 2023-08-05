<script setup>
  import { SlickList, SlickItem, DragHandle } from 'vue-slicksort'
  import { EyeIcon, EyeSlashIcon, LinkIcon, Bars4Icon } from '@heroicons/vue/24/solid'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref, onMounted } from "vue"

  const emit = defineEmits(['update-linked', 'goto-folder'])
  const props = defineProps({ articleId: { type: [Number, String], required: true }})
  const linkedFiles = ref([])
  const saveSort = () => {
    let ids = []
    linkedFiles.value.forEach(f => ids.push(f.id))
    vxFetch('article/' + props.articleId + '/linked-files').put(JSON.stringify({ fileIds: ids }))
  }
  const unlinkSort = async file => {
    const { data } = await vxFetch('article/' + props.articleId + '/link-file').put(JSON.stringify({ fileId: file.id })).json()
    if(data.value?.success) {
      linkedFiles.value.splice(linkedFiles.value.findIndex(item => item === file), 1)
      emit('update-linked')
    }
  }
  const toggleVisibility = async file => {
    const { data } = await vxFetch('article/' + props.articleId + '/toggle-linked-file').put(JSON.stringify({ fileId: file.id })).json()
    if(data.value?.success) {
      file.hidden = !!data.value.hidden
    }
  }
  onMounted(async () => { linkedFiles.value = (await vxFetch('article/' + props.articleId + '/linked-files').json()).data.value })
</script>
<template>
  <slick-list v-model:list="linkedFiles" lock-axis="y" @update:list="saveSort" useDragHandle>
    <slick-item v-for="(item, ndx) in linkedFiles" :key="item.id" :index="ndx" class="w-full space-x-4 py-2 flex items-center border-b last:border-none">
      <drag-handle class="cursor-pointer"><bars4-icon class="h-5 w-5" /></drag-handle>
      <div :class="['w-1/4', { 'text-slate-400': item.hidden }]">{{ item.filename }}</div>
      <div class="w-24 flex justify-center items-center">
        <img :src="item.src" alt="" v-if="item.isThumb && item.src" class="thumb">
        <div class="overflow-ellipsis whitespace-nowrap overflow-hidden" v-else>{{ item.type }}</div>
      </div>
      <div class="w-24 flex justify-center items-center space-x-2">
        <button class="icon-link" data-tooltip="Verlinkung entfernen" @click="unlinkSort(item)">
          <link-icon class="h-5 w-5" />
        </button>
        <button class="icon-link" :data-tooltip="item.hidden ? 'Anzeigen' : 'Verstecken'" @click="toggleVisibility(item)">
          <component :is="item.hidden ? EyeIcon : EyeSlashIcon" class="h-5 w-5" />
        </button>
      </div>
      <a class="w-1/2" :href="'#'+ item.folder.path" @click.prevent="emit('goto-folder', item.folder)">{{ item.folder.path }}</a>
    </slick-item>
  </slick-list>
</template>