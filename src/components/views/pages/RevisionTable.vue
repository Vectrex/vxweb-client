<script setup>
  import FormSwitch from "@/components/vx-vue/form-switch.vue"
  import { EyeIcon, TrashIcon } from '@heroicons/vue/24/solid'
  import { computed } from "vue"
  import { useDateFormat } from "@vueuse/core"

  const emit = defineEmits(['activate-revision', 'load-revision', 'delete-revision'])
  const props = defineProps({ revisions: { type: Array, default: [] }})
  const sortedRevisions = computed(() => props.revisions.slice().sort((a, b) => a.firstCreated < b.firstCreated ? 1 : -1))
</script>

<template>
  <div :class="$attrs['class']">
    <div class="font-bold">Revisionen</div>
    <table class="w-full">
      <thead class="bg-slate-600 text-white sticky top-0 z-10">
        <tr>
          <th class="px-6 py-3 text-left">Angelegt um</th>
          <th />
          <th class="px-6 py-3">aktiv</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(revision, ndx) in sortedRevisions" :key="revision.id" :class="ndx % 2 ? 'bg-slate-200' : ''">
          <td class="px-6 py-2">{{ useDateFormat(revision.firstCreated, 'YYYY-MM-DD HH:mm:ss').value }}</td>
          <td class="px-6 py-2">
            <button class="icon-link tooltip" data-tooltip="Ansicht" @click="emit('load-revision', revision)"><eye-icon class="h-5 w-5" /></button>
          </td>
          <td class="px-6 py-2 text-center">
            <form-switch @update:model-value="emit('activate-revision', revision)" :model-value="revision.active" :disabled="revision.active" />
          </td>
          <td class="px-6 py-2 text-right">
            <button class="icon-link tooltip" data-tooltip="Löschen" @click="emit('delete-revision', revision)" v-if="!revision.active"><trash-icon class="h-5 w-5" /></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>