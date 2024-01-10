<script setup>
  import { FormSwitch } from "vx-vue"
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
      <thead class="sticky top-0 z-10 text-white bg-slate-600">
        <tr>
          <th class="py-3 px-6 text-left">Angelegt um</th>
          <th />
          <th class="py-3 px-6">aktiv</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(revision, ndx) in sortedRevisions" :key="revision.id" :class="ndx % 2 ? 'bg-slate-200' : ''">
          <td class="py-2 px-6">{{ useDateFormat(revision.firstCreated, 'YYYY-MM-DD HH:mm:ss').value }}</td>
          <td class="py-2 px-6">
            <button class="icon-link tooltip" data-tooltip="Ansicht" @click="emit('load-revision', revision)"><eye-icon class="size-5" /></button>
          </td>
          <td class="py-2 px-6 text-center">
            <form-switch @update:model-value="emit('activate-revision', revision)" :model-value="revision.active" :disabled="revision.active" />
          </td>
          <td class="py-2 px-6 text-right">
            <button class="icon-link tooltip" data-tooltip="Löschen" @click="emit('delete-revision', revision)" v-if="!revision.active"><trash-icon class="size-5" /></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>