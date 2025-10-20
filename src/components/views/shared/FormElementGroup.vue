<script setup>
  import { VFloatingLabel } from 'vx-vue'
  import { onMounted } from 'vue'

  const model = defineModel({ type: Object })
  const props = defineProps({
      fields: { type: Array, default: () => [], validator: v => v.every(item => item.model) },
      errors: { type: Object, default: () => ({}) },
    }
  )
  onMounted(() => model.value = { ...Object.fromEntries(props.fields.map(f => [f.model, f.default !== undefined ? f.default : null])), ...model.value })
</script>

<template>
  <div>
    <div v-for="field in fields" :key="field.model" class="relative">
      <input
        v-if="!field.type"
        :id="field.model"
        v-model.trim="model[field.model]"
        v-floating-label="{ invalid: errors[field.model] }"
        :required="field.required"
        v-bind="field.attrs?.value || field.attrs"
      >
      <component
        :is="field.type"
        v-else
        :id="field.model"
        v-model.trim="model[field.model]"
        v-floating-label="{ invalid: errors[field.model] }"
        :options="field.options || undefined"
        :required="field.required"
        v-bind="field.attrs?.value || field.attrs"
      />
      <p v-if="errors[field.model]" class="text-sm text-error">
        {{ errors[field.model] }}
      </p>
    </div>
  </div>
</template>
