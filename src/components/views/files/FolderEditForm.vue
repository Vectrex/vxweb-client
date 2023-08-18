<script setup>
  import SubmitButton from "@/components/misc/submit-button.vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { computed, ref, watch } from "vue"

  const props = defineProps({ id: Number })
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
    const response = (await doFetch('folder/' + props.id).put(JSON.stringify(sanitizedForm.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit('response-received', { ...response, payload: response.form || null })
  }
  watch(() => props.id, async v => { form.value = (await doFetch('folder/' + v).json()).data.value || {} }, { immediate: true })
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
      <template #title>{{ form.path }}</template>
      <template #content>
          <div class="px-4 pt-20 pb-4 space-y-4">
              <div v-for="field in fields" class="relative">
                  <input
                          v-if="!field.type"
                          :id="field.model + '-input'"
                          class="w-full form-input peer"
                          v-model="form[field.model]"
                          placeholder=" "
                  />
                  <textarea
                          v-else-if="field.type === 'textarea'"
                          class="w-full form-textarea peer"
                          :id="field.model + '-' + field.type"
                          v-model="form[field.model]"
                          placeholder=" "
                  />
                  <label
                      :class="['floating-label', { 'text-error': errors[field.model], 'required': field.required }]"
                      :for="field.model + '-' + field.type || 'input'"
                  >
                    {{ field.label }}
                  </label>
                  <p v-if="errors[field.model]" class="text-sm text-error">{{ errors[field.model] }}</p>
              </div>
              <submit-button :busy="busy" @submit="submit">Daten übernehmen</submit-button>
          </div>
      </template>
  </form-dialog>
</template>