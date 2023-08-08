<script setup>
  import PasswordInput from "@/components/vx-vue/password-input.vue"
  import Headline from "@/components/app/Headline.vue"
  import SubmitButton from "@/components/misc/submit-button.vue"
  import Divider from "@/components/misc/divider.vue"
  import { onMounted, ref } from "vue"
  import { vxFetch } from "@/composables/vxFetch"

  const emit = defineEmits(['notify'])

  const fields = [
    { model: 'username', label: 'Username', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { model: 'email', label: 'E-Mail', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { model: 'name', label: 'Name', attrs: { maxlength: 128, autocomplete: "off" }, required: true },
    { type: PasswordInput, model: 'new_PWD', label: 'Neues Passwort', attrs: { maxlength: 128, autocomplete: "off" } },
    { type: PasswordInput, model: 'new_PWD_verify', label: 'Passwort wiederholen', attrs: { maxlength: 128, autocomplete: "off" } }
  ]
  const form = ref({})
  const errors = ref({})
  const busy = ref(false)
  const notifications = ref([])

  onMounted(async () => {
    const { data } = await vxFetch('profile_data').json()
    notifications.value = data.value?.notifications || []
    form.value = data.value?.formData || {}
  })
  const submit = async () => {
    busy.value = true
    const { data } = await vxFetch('profile_data').post(JSON.stringify(form.value)).json()
    busy.value = false
    errors.value = data.value?.errors || {}
    emit('notify', data.value)
  }
</script>

<template>
  <teleport to="#tools">
    <headline>{{ $route.meta?.heading }}</headline>
  </teleport>

  <div class="pb-4 space-y-4">
    <div class="space-y-4">
        <div v-for="(field, ndx) in fields" :key="ndx">
          <label :for="field.model + '-' + (field.type || 'input')" :class=" { required: field.required, 'text-error': errors[field.model] }">{{ field.label }}</label>
          <div>
            <input
                class="w-96 form-input"
                v-if="!field.type"
                :id="field.model + '-input'"
                v-model="form[field.model]"
            />
            <component :is="field.type"
                v-else
                :id="field.model + '-' + field.type"
                v-model="form[field.model]"
                class="w-96"
            />
            <p v-if="errors[field.model]" class="text-sm text-error">{{ errors[field.model] }}</p>
          </div>
        </div>
      </div>

      <template v-if="notifications.length">

        <divider>Benachrichtigungen</divider>

        <div class="space-y-4">
          <div class="space-x-2" v-for="notification in notifications">
            <label class="space-x-2">
              <input v-bind:value="notification.alias" type="checkbox" class="form-checkbox" v-model="form.notifications" />
              <span>{{ notification.label }}</span>
            </label>
          </div>
        </div>
      </template>

    <submit-button :busy="busy" @submit="submit">Änderungen speichern</submit-button>
  </div>
</template>
