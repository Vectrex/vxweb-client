<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    breadcrumbs: { type: Array, default: () => [] },
    folders:  { type: Array, default: () => [] },
    currentFolder: { type: [Number, String], default: null }
  })
  const emit = defineEmits(['breadcrumb-clicked'])
  const items = ref([])
  watch (() => props.breadcrumbs, v => {
    if (
        v.length >= items.value.length ||
        items.value.map(item => item.id).join().indexOf(v.map(item => item.id).join())
    ) {
      items.value = v
    }
  })
  watch (() => props.folders, v => {
    let current = items.value.findIndex(item => item.id === props.currentFolder)

    if (items.value[current + 1]) {
      let ndx = v.findIndex(({ id }) => id === items.value[current + 1].id)

      // check for deletion

      if (ndx === -1) {
        items.value = items.value.slice(0, current + 1)
      }

      // handle possible rename

      else {
        items.value[current + 1].name = v[ndx].name
      }
    }
  }, { deep: true })
</script>

<template>
  <span class="flex items-center">
    <button
      v-for="(breadcrumb, ndx) in items"
      :key="ndx"
      :class="['max-w-32 truncate border-t-2 border-r border-b-2 border-l border-vxvue-500 px-3 py-2 text-vxvue-500',
               {
                 'rounded-l border-l-2!': ndx === 0,
                 'rounded-r border-r-2!': ndx === items.length -1,
                 'bg-vxvue-500 text-white!': breadcrumb.id === currentFolder
               }
      ]"
      @click="emit('breadcrumb-clicked', breadcrumb)"
    >{{ breadcrumb.name }}
    </button>
  </span>
</template>
