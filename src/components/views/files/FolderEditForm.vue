<script setup>
  import { SubmitButton } from 'vx-vue'
  import FormDialog from '@/components/views/shared/FormDialog.vue'
  import FormElementGroup from '@/components/views/shared/FormElementGroup.vue'
  import { useVxFetch } from '@/composables/useVxFetch'
  import { computed, ref, watch } from 'vue'

  const props = defineProps({ id: { type: Number, default: null }})
  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])

  const form = ref({})
  const errors = ref({})
  const busy = ref(false)
  const fields = [
    { model: 'title', attrs: { placeholder: 'Titel', class: 'w-full' }},
    { model: 'description', type: 'textarea', attrs: { placeholder: 'Beschreibung', class: 'w-full' }}
  ]
  const sanitizedForm = computed(() => {
      let sanitized = {}
      for (const [key, value] of Object.entries(form.value)) {
        if(value !== null) {
          sanitized[key] = value
        }
      }
      return sanitized
  })
  const doFetch = useVxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('folder/' + props.id).put(JSON.stringify(sanitizedForm.value)).json()).data.value
    busy.value = false
    if(!response) {
      emit('cancel')
    }
    else {
      errors.value = response.errors || {}
      emit('response-received', { ...response, payload: response.form || null })
    }
  }
  watch(() => props.id, async v => {
    const response = (await doFetch('folder/' + v).json()).data.value
    if (response) {
      form.value = response || Object.fromEntries(fields.map(f => [f.model, f.default !== undefined ? f.default : null]))
    }
    else {
      emit('cancel')
    }
  }, { immediate: true })
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
    <template #title>
      {{ form.path }}
    </template>
    <template #content>
      <div class="p-4 space-y-2">
        <form-element-group v-model="form" :fields="fields" class="space-y-2" />
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          Daten übernehmen
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>