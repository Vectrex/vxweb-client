<script setup>
  import SubmitButton from "@/components/misc/submit-button.vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import FormSelect from "@/components/vx-vue/form-select.vue"
  import PasswordInput from "@/components/vx-vue/password-input.vue"
  import {computed, ref, watch} from "vue"
  import {customFetch} from "@/util/customFetch"

  const props = defineProps({
    id: { type: [String, Number], default: null }
  })
  const emit = defineEmits(['cancel', 'response-received'])
  const fields = [
    { model: 'username', label: 'Username', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { model: 'email', label: 'E-Mail', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { model: 'name', label: 'Name', attrs: {maxlength: 128, autocomplete: "off"}, required: true },
    { type: FormSelect, model: 'admingroupsid', label: 'Gruppe', required: true, options: [] },
    { type: PasswordInput, model: 'new_PWD', label: 'Neues Passwort', attrs: {maxlength: 128, autocomplete: "off" }},
    { type: PasswordInput, model: 'new_PWD_verify', label: 'Passwort wiederholen', attrs: {maxlength: 128, autocomplete: "off" }}
  ]
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
  watch(() => props.id, async newValue => {
    const { data } = await customFetch('user/' + (newValue || '')).json()
    options.value = data.value.options || {}
    form.value = data.value.form || {}
  }, { immediate: true })
  const submit = async () => {
    busy.value = true
    const { data } = await customFetch('user/' + (form.value.id || ''))[form.value.id ? 'put' : 'post'](JSON.stringify(sanitizedForm.value)).json()
    busy.value = false

    if (data.value.success) {
      errors.value = {}
      form.value = data.value.form
      emit('response-received', { success: true, message: data.value.message, payload: Object.assign({}, data.value.form) || null })
    }
    else {
      errors.value = data.value.errors || {}
      emit('response-received', { success: false, message: data.value.message })
    }
  }
</script>
<template>
  <form-dialog @cancel="$emit('cancel')">
      <template #title>Benutzer {{ form.id ? 'bearbeiten' : 'anlegen' }}</template>
      <template #content>
          <div class="px-4 pt-20 pb-4 space-y-4">
              <div v-for="(field, ndx) in fields" :key="ndx">
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
                  <component :is="field.type"
                             v-else
                             class="w-full"
                             :id="field.model + '-' + field.type"
                             v-model="form[field.model]"
                             :options="options[field.model]"
                  />
                  <p v-if="errors[field.model]" class="text-sm text-error">{{ errors[field.model] }}</p>
              </div>
              <submit-button :busy="busy" @submit="submit">{{ form.id ? 'Daten übernehmen' : 'User anlegen' }}</submit-button>
          </div>

      </template>
  </form-dialog>
</template>