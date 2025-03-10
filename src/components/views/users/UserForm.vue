<script setup>
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import { FormSelect, PasswordInput, SubmitButton } from "vx-vue"
  import { computed, ref, watch } from "vue"
  import { vxFetch } from "@/composables/vxFetch"

  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])
  const props = defineProps({
    id: { type: [String, Number], default: null }
  })
  const form = ref({})
  const errors = ref({})
  const options = ref({})
  const busy = ref(false)
  const sanitizedForm = computed(() => {
    let sanitized = {}
    for (const [key, value] of Object.entries(form.value)) {
      if(value !== null) {
        sanitized[key] = value
      }
    }
    return sanitized
  })
  const fields = [
    { model: 'username', label: 'Username', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { model: 'email', label: 'E-Mail', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { model: 'name', label: 'Name', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { type: FormSelect, model: 'admingroupsid', label: 'Gruppe', required: true, options: [] },
    { type: PasswordInput, model: 'new_PWD', label: 'Neues Passwort', attrs: {maxlength: 128, autocomplete: "off" }},
    { type: PasswordInput, model: 'new_PWD_verify', label: 'Passwort wiederholen', attrs: {maxlength: 128, autocomplete: "off" }}
  ]
  const doFetch = vxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('user/' + (form.value.id || ''))[form.value.id ? 'put' : 'post'](JSON.stringify(sanitizedForm.value)).json()).data.value
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
    const response = (await doFetch('user/' + (v || '')).json()).data.value
    if (response) {
      options.value = response.options || {}
      form.value = response.form || {}
    }
    else {
      emit('cancel')
    }
  }, { immediate: true })
</script>
<template>
  <form-dialog @cancel="emit('cancel')">
    <template #title>
      Benutzer {{ form.id ? 'bearbeiten' : 'anlegen' }}
    </template>
    <template #content>
      <div class="px-4 pt-20 pb-4 space-y-4">
        <div v-for="field in fields" :key="field.model" class="relative">
          <template v-if="!field.type">
            <input
              :id="field.model"
              v-model.trim="form[field.model]"
              class="w-full form-input peer"
              placeholder=" "
            >
            <label
              :class="['floating-label', { 'text-error': errors[field.model], 'required': field.required }]"
              :for="field.model"
            >
              {{ field.label }}
            </label>
          </template>
          <template v-else>
            <component
              :is="field.type"
              :id="field.model"
              v-model.trim="form[field.model]"
              :options="options[field.model]"
              class="w-full"
              placeholder=" "
            >
              <label
                :class="['floating-label', { 'text-error': errors[field.model], 'required': field.required }]"
                :for="field.model"
              >
                {{ field.label }}
              </label>
            </component>
          </template>
          <p v-if="errors[field.model]" class="text-sm text-error">
            {{ errors[field.model] }}
          </p>
        </div>
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          {{ form.id ? 'Daten übernehmen' : 'User anlegen' }}
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>