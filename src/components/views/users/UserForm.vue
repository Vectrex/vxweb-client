<script setup>
  import FormDialog from '@/components/views/shared/FormDialog.vue'
  import Divider from '@/components/misc/divider.vue'
  import { FormSelect, PasswordInput, SubmitButton, VFloatingLabel } from 'vx-vue'
  import { vxFetch } from '@/composables/vxFetch'
  import { computed, ref, watch } from 'vue'

  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])
  const props = defineProps({
    id: { type: [String, Number], default: null }
  })
  const doFetch = vxFetch(emit)
  const errors = ref({})
  const adminGroups = ref([])
  const busy = ref(false)
  const sanitizedForm = computed(() => {
    let sanitized = { misc: {} }
    for (const [key, value] of Object.entries(form.value)) {
      if(value !== null) {
        if (key.startsWith('misc.')) {
          sanitized.misc[key.replace('misc.', '')] = value
        }
        else {
          sanitized[key] = value
        }
      }
    }
    return sanitized
  })
  const fields = [
    { model: 'username', default: '', attrs: { placeholder: 'Username', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { model: 'email', default: '', attrs: { placeholder: 'E-Mail', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { model: 'name', default: '', attrs: { placeholder: 'Name', maxlength: 128, autocomplete: "off", class: "w-full form-input" }, required: true },
    { type: FormSelect, model: 'admingroupsid', attrs: ref({ options: adminGroups, placeholder: "(Gruppe)", class: "w-full" }), required: true },
    { type: PasswordInput, model: 'new_PWD', attrs: { placeholder: 'Neues Passwort', maxlength: 128, autocomplete: "off", class: "w-full" }},
    { type: PasswordInput, model: 'new_PWD_verify', attrs: { placeholder: 'Passwort wiederholen', maxlength: 128, autocomplete: "off", class: "w-full" }}
  ]
  const miscFields = []
  const form = ref({})
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
      form.value = response.form || Object.fromEntries(fields.map(f => [f.model, f.default !== undefined ? f.default : null]))

      if (form.value.misc) {
        for (const [key, value] of Object.entries(form.value.misc)) {
          form.value[`misc.${key}`] = value
        }
        unset(form.value, 'misc')
      }
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
        <div v-for="field in fields" :key="field.model">
          <input
            v-if="!field.type"
            :id="field.model"
            v-model.trim="form[field.model]"
            v-floating-label="{ invalid: errors[field.model] }"
            :required="field.required"
            v-bind="field.attrs.value || field.attrs"
          >
          <component
            :is="field.type"
            v-else
            :id="field.model"
            v-model.trim="form[field.model]"
            :required="field.required"
            v-bind="field.attrs.value || field.attrs"
          />
          <p v-if="errors[field.model]" class="text-sm text-error">
            {{ errors[field.model] }}
          </p>
        </div>
        <template v-if="miscFields && miscFields.length">
          <divider>Zusatzinformationen</divider>
          <div v-for="field in miscFields" :key="field.model">
            <input
              v-if="!field.type"
              :id="'misc.' + field.model"
              v-model.trim="form['misc.' + field.model]"
              v-floating-label="{ invalid: errors['misc.' + field.model] }"
              :required="field.required"
              v-bind="field.attrs.value || field.attrs"
            >
            <component
              :is="field.type"
              v-else
              :id="'misc.' + field.model"
              v-model.trim="form['misc.' + field.model]"
              v-floating-label="{ invalid: errors['misc.' + field.model] }"
              :required="field.required"
              v-bind="field.attrs.value || field.attrs"
            />
            <p v-if="errors[field.model]" class="text-sm text-error">
              {{ errors[field.model] }}
            </p>
          </div>
        </template>
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          {{ form.id ? 'Daten übernehmen' : 'User anlegen' }}
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>