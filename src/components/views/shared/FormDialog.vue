<script setup>
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  const emit = defineEmits(['cancel'])
</script>
<template>
  <div class="ring-1 shadow-sm ring-black/10">
    <form-title class="w-[var(--sidebar-width)]" @cancel="emit('cancel')">
      <slot name="title" />
    </form-title>
    <div class="overflow-hidden h-[calc(100vh-var(--header-height)-var(--form-title-height))]">
      <div class="overflow-y-auto h-full">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>