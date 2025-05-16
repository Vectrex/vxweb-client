<script setup>
  import { useAuthStore } from '@/stores/auth'
  import { PasswordInput, SubmitButton } from 'vx-vue'
  import Divider from '@/components/misc/divider.vue'
  import { vxFetch } from '@/composables/vxFetch'
  import { onMounted, ref } from 'vue'

  const emit = defineEmits(['notify', 'fetch-error', 'cancel'])

  const fields = [
    { model: 'username', label: 'Username', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { model: 'email', label: 'E-Mail', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { model: 'name', label: 'Name', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { type: PasswordInput, model: 'new_PWD', label: 'Neues Passwort', attrs: { maxlength: 128, autocomplete: "off" } },
    { type: PasswordInput, model: 'new_PWD_verify', label: 'Passwort wiederholen', attrs: { maxlength: 128, autocomplete: "off" } }
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
    notifications.value = response.notifications || []
    form.value = response.formData || {}
  })
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <div v-for="field in fields" :key="field.model">
        <label :for="field.model" :class=" { required: field.required, 'text-error': errors[field.model] }">{{ field.label }}</label>
        <div>
          <input
            v-if="!field.type"
            :id="field.model"
            v-model.trim="form[field.model]"
            class="form-input w-full"
          >
          <component
            :is="field.type"
            v-else
            :id="field.model"
            v-model.trim="form[field.model]"
            class="w-full"
          />
          <p v-if="errors[field.model]" class="text-sm text-error">
            {{ errors[field.model] }}
          </p>
        </div>
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
