<script setup>
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import { FormSelect, PasswordInput, SubmitButton, VFloatingLabel } from "vx-vue"
  import { computed, ref, watch } from "vue"
  import { vxFetch } from "@/composables/vxFetch"

  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])
  const props = defineProps({
    id: { type: [String, Number], default: null }
  })
  const form = ref({})
  const errors = ref({})
  const adminGroups = ref([])
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
    { model: 'username', attrs: { placeholder: 'Username', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { model: 'email', attrs: { placeholder: 'E-Mail', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { model: 'name', attrs: { placeholder: 'Name', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { type: FormSelect, model: 'admingroupsid', attrs: ref({ options: adminGroups, disabledLabel: "(Gruppe)", class: "w-full" }), required: true },
    { type: PasswordInput, model: 'new_PWD', attrs: { placeholder: 'Neues Passwort', maxlength: 128, autocomplete: "off", class: "w-full" }},
    { type: PasswordInput, model: 'new_PWD_verify', attrs: { placeholder: 'Passwort wiederholen', maxlength: 128, autocomplete: "off", class: "w-full" }}
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
      adminGroups.value = response.options?.admingroupsid || []
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
      <div class="p-4 space-y-2">
        <div v-for="field in fields" :key="field.model" class="relative">
          <template v-if="!field.type">
            <input
              :id="field.model"
              :required="field.required"
              v-model.trim="form[field.model]"
              v-bind="field.attrs.value || field.attrs"
              v-floating-label="{ invalid: errors[field.model] }"
            >
          </template>
          <template v-else>
            <component
              :is="field.type"
              :id="field.model"
              :required="field.required"
              v-model.trim="form[field.model]"
              v-bind="field.attrs.value || field.attrs"
            >
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