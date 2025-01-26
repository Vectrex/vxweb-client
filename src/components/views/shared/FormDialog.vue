<script setup>
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  const emit = defineEmits(['cancel'])
</script>
<template>
    <div class="ring-1 ring-black/5 shadow-sm">
        <form-title @cancel="emit('cancel')" class="w-sidebar"><slot name="title" /></form-title>
        <div class="overflow-hidden h-[calc(100vh-var(--header-height))]">
            <div class="overflow-y-auto h-full">
                <slot name="content" />
            </div>
        </div>
    </div>
</template>