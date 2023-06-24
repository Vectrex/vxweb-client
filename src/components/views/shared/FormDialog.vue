<script setup>
  import FormTitle from "@/components/views/shared/FormTitle.vue"
  const emit = defineEmits(['cancel'])
</script>
<template>
    <div class="shadow ring-1 ring-black ring-opacity-10">
        <form-title @cancel="emit('cancel')" class="w-sidebar"><slot name="title" /></form-title>
        <div class="overflow-hidden h-[calc(100vh-var(--header-height))]">
            <div class="h-full overflow-y-auto">
                <slot name="content" />
            </div>
        </div>
    </div>
</template>