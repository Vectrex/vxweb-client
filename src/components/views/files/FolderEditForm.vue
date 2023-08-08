<script setup>
  import SubmitButton from "@/components/misc/submit-button.vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { computed, ref, watch } from "vue"

  const props = defineProps({ id: Number })
  const emit = defineEmits(['cancel', 'response-received'])

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
  watch(() => props.id, async v => {
    const { data } = await vxFetch('folder/' + v).json()
    form.value = data.value || {}

  }, { immediate: true })

  const submit = async () => {
    busy.value = true
    const response = (await vxFetch('folder/' + props.id).put(JSON.stringify(sanitizedForm.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit(
    'response-received',
    response.success ?
      { success: true, message: response.message, payload: response.form || null } :
      { success: false, message: response.message }
    )
  }
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
      <template #title>{{ form.path }}</template>
      <template #content>
          <div class="px-4 pt-20 pb-4 space-y-4">
              <div v-for="field in fields">
                  <label
                          :class="{ 'text-error': errors[field.model], 'required': field.required }"
                          :for="field.model + '-' + field.type || 'input'"
                  >
                      {{ field.label }}
                  </label>
                  <input
                          v-if="!field.type"
                          :id="field.model + '-input'"
                          class="w-full form-input"
                          v-model="form[field.model]"
                  />
                  <textarea
                          v-else-if="field.type === 'textarea'"
                          class="w-full form-textarea"
                          :id="field.model + '-' + field.type"
                          v-model="form[field.model]"
                  />
                  <p v-if="errors[field.model]" class="text-sm text-error">{{ errors[field.model] }}</p>
              </div>
              <submit-button :busy="busy" @submit="submit">Daten übernehmen</submit-button>
          </div>
      </template>
  </form-dialog>
</template>