<script setup>
  import { XMarkIcon } from '@heroicons/vue/24/solid'
  const emit = defineEmits(['cancel'])
</script>
<template>
  <div class="flex justify-between items-center px-4 text-white h-[var(--form-title-height)] bg-vxvue-500">
    <span class="text-xl font-bold"><slot /></span>
    <button class="p-1 rounded-sm border-2 border-transparent transition duration-300 hover:text-current hover:border-current text-current/75" @click.prevent="emit('cancel')">
      <x-mark-icon class="size-5" />
    </button>
  </div>
</template>