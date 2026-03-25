<script setup>
  import Tiptap from '@/components/misc/tiptap.vue'
  import { SubmitButton } from 'vx-vue'
  import { useVxFetch } from '@/composables/useVxFetch'
  import { ref, watch } from 'vue'

  const emit = defineEmits(['response-received', 'open-file-manager', 'fetch-error'])
  const props = defineProps({
    initData: { type: Object, default: () => ({}) },
    id: { type: [Number, String], default: null }
  })
  const form = ref({})
  const errors = ref({})
  const busy = ref(false)
  const tiptap = ref(null)
  const fields = [
    { type: 'text', model: 'title', label: 'Titel', required: true },
    { type: 'textarea', model: 'description', label: 'Beschreibung' },
    { type: 'textarea', model: 'keywords', label: 'Schlüsselworte' }
  ]
  const doFetch = useVxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('page/' + (props.id || ''))[props.id ? 'put' : 'post'](JSON.stringify(form.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit('response-received', response)
  }
  watch(() => props.initData, v => form.value = v || Object.fromEntries(fields.map(f => [f.model, f.default !== undefined ? f.default : null])), { immediate: true })
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center">
      <label
        for="alias-input"
        :class="['required', { 'text-error': errors.alias }]"
      >Eindeutiger Name</label>
      <input
        id="alias-input"
        :value="form.alias"
        class="w-full form-input"
        :disabled="id"
        maxlength="64"
        @input="form.alias = $event.target.value.toUpperCase()"
      >
      <p v-if="errors.alias" class="text-sm text-error">
        {{ errors.alias }}
      </p>
    </div>

    <div v-for="field in fields" :key="field.model" class="flex flex-wrap items-center">
      <label :for="field.model" :class="{ required: field.required, 'text-error': errors[field.model] }">{{ field.label }}</label>
      <input
        v-if="['text', 'number'].includes(field.type)"
        :id="field.model"
        v-model="form[field.model]"
        :type="field.type"
        class="w-full form-input"
        v-bind="field.attrs"
      >
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.model"
        v-model="form[field.model]"
        class="w-full form-textarea"
      />
    </div>
    <div class="flex flex-wrap items-center">
      <label for="markup" :class="['required', { 'text-error': errors.markup }]">Inhalt</label>
      <tiptap
        id="markup"
        ref="tiptap"
        v-model="form.markup"
        class="w-full"
        @open-file-manager="emit('open-file-manager')"
      />
    </div>
    <submit-button :busy="busy" theme="success" class="button" @submit="submit">
      Änderungen speichern
    </submit-button>
  </div>
</template>