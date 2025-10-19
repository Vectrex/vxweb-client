<script setup>
  import { useAuthStore } from '@/stores/auth'
  import { PasswordInput, SubmitButton, VFloatingLabel } from 'vx-vue'
  import Divider from '@/components/misc/divider.vue'
  import { vxFetch } from '@/composables/vxFetch'
  import { onMounted, ref } from 'vue'

  const emit = defineEmits(['notify', 'fetch-error', 'cancel'])

  const fields = [
    { model: 'username', default: '', required: true, attrs: { placeholder: 'Username', maxlength: 128, autocomplete: "off", class: "w-full form-input" }},
    { model: 'email', default: '', required: true, attrs: { placeholder: 'E-Mail', maxlength: 128, autocomplete: "off", class: "w-full form-input" }},
    { model: 'name', default: '', required: true, attrs: { placeholder: 'Name', maxlength: 128, autocomplete: "off", class: "w-full form-input" }},
    { model: 'new_PWD', type: PasswordInput, default: '', attrs: { placeholder: 'Neues Passwort', maxlength: 128, autocomplete: "off", class: "w-full" }},
    { model: 'new_PWD_verify', type: PasswordInput, default: '', attrs: { placeholder: 'Passwort wiederholen', maxlength: 128, autocomplete: "off", class: "w-full" }}
  ]
  const authStore = useAuthStore()
  const form = ref({})
  const errors = ref({})
  const busy = ref(false)
  const notifications = ref([])
  const doFetch = vxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('profile_data').post(JSON.stringify(form.value)).json()).data.value || {}
    busy.value = false
    if (response.success) {
      authStore.credentials.user = response.payload
    }
    errors.value = response.errors || {}
    emit('notify', response)
  }
  onMounted(async () => {
    const response = (await doFetch('profile_data').json()).data.value || {}
    const defaults = {}
    fields.forEach(f => defaults[f.model] = f.default)
    notifications.value = response.notifications || []
    form.value = response.formData || Object.fromEntries(fields.map(f => [f.model, f.default !== undefined ? f.default : null]))
  })
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">


      <div v-for="field in fields" :key="field.model" class="relative">
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
          v-floating-label="{ invalid: errors[field.model] }"
          :required="field.required"
          v-bind="field.attrs.value || field.attrs"
        />
        <p v-if="errors[field.model]" class="text-sm text-error">
          {{ errors[field.model] }}
        </p>
      </div>
    </div>

    <template v-if="notifications.length">
      <divider>Benachrichtigungen</divider>
      <div class="space-y-4">
        <div v-for="notification in notifications" :key="notification.alias" class="space-x-2">
          <label class="space-x-2">
            <input v-model="form.notifications" :value="notification.alias" type="checkbox" class="form-checkbox">
            <span>{{ notification.label }}</span>
          </label>
        </div>
      </div>
    </template>

    <div class="flex items-center justify-between">
      <button class="button cancel" @click="emit('cancel')">Abbrechen</button>
      <submit-button :busy="busy" theme="success" class="button" @submit="submit">
        Änderungen speichern
      </submit-button>
    </div>
  </div>
</template>
