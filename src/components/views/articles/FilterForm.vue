<script setup>
  import { FormSelect } from "vx-vue"
  const props = defineProps({
    modelValue: { type: Object, default: () => ({}) },
    options: { type: Object, default: () => ({}) },
  })
  const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center space-x-2">
    <input
      :value="modelValue.title"
      placeholder="Filtern nach Titel..."
      class="form-input"
      @input="emit('update:modelValue', { ...modelValue, title: $event.target.value } )"
    >
    <form-select
      :options="options.categories"
      :model-value="modelValue.cat"
      class="form-select"
      @update:model-value="emit('update:modelValue', { ...modelValue, cat: parseInt($event, 10) } )"
    />
  </div>
</template>