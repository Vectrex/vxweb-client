<script setup>
  import { XMarkIcon } from '@heroicons/vue/24/solid'
  const emit = defineEmits(['cancel'])
</script>
<template>
  <div class="flex fixed justify-between items-center px-4 h-16 bg-vxvue-500">
    <span class="text-xl font-bold text-white"><slot /></span>
    <a href="#" @click.prevent="emit('cancel')"><x-mark-icon class="size-5 text-white" /></a>
  </div>
</template>