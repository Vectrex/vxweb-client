<script setup>
  import { FormSelect } from 'vx-vue'
  const model = defineModel({ type: Object, default: () => ({}) })
  const props = defineProps({ options: { type: Object, default: () => ({}) }})
</script>

<template>
  <div class="flex items-center space-x-2">
    <input
      :value="model.title"
      placeholder="Filtern nach Titel..."
      class="form-input"
      @input="model = { ...model, title: $event.target.value }"
    >
    <form-select
      :options="options.categories"
      :model-value="model.cat"
      class="form-select"
      @update:model-value="model = { ...model, cat: parseInt($event, 10) }"
    />
  </div>
</template>