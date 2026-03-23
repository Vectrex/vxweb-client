<script setup>
  const props = defineProps ({ progress: { type: Number, default: 0, validator: v => v >= 0 && v <= 100 }})
</script>

<template>
  <div>
    <div class="h-full rounded-full bg-vxvue-500" :style="{ width: progress + '%' }" />
  </div>
</template>