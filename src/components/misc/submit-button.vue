<script setup>
  import Spinner from "@/components/misc/spinner.vue"
  const props = defineProps({ busy: Boolean })
  const emit = defineEmits(['submit'])
</script>

<template>
  <div class="flex items-center space-x-2">
    <button class="button success" @click="emit('submit')" :disabled="busy"><slot /></button>
    <spinner v-if="busy" class="!text-green-700" />
  </div>
</template>
