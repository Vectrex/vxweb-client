<script setup>
  import { SubmitButton } from "vx-vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { computed, ref, watch } from "vue"

  const props = defineProps({ id: { type: Number, default: null }})
  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])

  const form = ref({})
  const errors = ref({})
  const busy = ref(false)
  const fields = [
    { model: 'title', label: 'Titel' },
    { type: 'textarea', model: 'description', label: 'Beschreibung' }
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
  const doFetch = vxFetch(emit)
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
      form.value = response
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
      <div class="px-4 pt-20 pb-4 space-y-4">
        <div v-for="field in fields" :key="field.model" class="relative">
          <input
            v-if="!field.type"
            :id="field.model + '-input'"
            v-model="form[field.model]"
            class="w-full form-input peer"
            placeholder=" "
          >
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.model + '-' + field.type"
            v-model="form[field.model]"
            class="w-full form-textarea peer"
            placeholder=" "
          />
          <label
            :class="['floating-label', { 'text-error': errors[field.model], 'required': field.required }]"
            :for="field.model + '-' + field.type || 'input'"
          >
            {{ field.label }}
          </label>
          <p v-if="errors[field.model]" class="text-sm text-error">
            {{ errors[field.model] }}
          </p>
        </div>
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          Daten übernehmen
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>