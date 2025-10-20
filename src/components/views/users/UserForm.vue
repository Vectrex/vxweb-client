<script setup>
  import FormDialog from '@/components/views/shared/FormDialog.vue'
  import FormElementGroup from '@/components/views/shared/FormElementGroup.vue'
  import Divider from '@/components/misc/divider.vue'
  import { FormSelect, PasswordInput, SubmitButton } from 'vx-vue'
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
  const form = ref({})
  const miscForm = ref({})
  const sanitizedForm = computed(() => ({
    ...Object.fromEntries(Object.entries(form.value).filter(([_, v]) => v !== null && v !== undefined)),
    misc: Object.fromEntries(Object.entries(miscForm.value).filter(([_, v]) => v !== null && v !== undefined))
  }))
  const fields = [
    { model: 'username', default: '', attrs: { placeholder: 'Username', maxlength: 128, autocomplete: "off", class: "w-full" }, required: true },
    { model: 'email', default: '', attrs: { placeholder: 'E-Mail', maxlength: 128, autocomplete: "off", class: "w-full" }, required: true },
    { model: 'name', default: '', attrs: { placeholder: 'Name', maxlength: 128, autocomplete: "off", class: "w-full" }, required: true },
    { type: FormSelect, model: 'admingroupsid', attrs: ref({ options: adminGroups, placeholder: "(Gruppe)", class: "w-full" }), required: true },
    { type: PasswordInput, model: 'new_PWD', attrs: { placeholder: 'Neues Passwort', maxlength: 128, autocomplete: "off", class: "w-full" }},
    { type: PasswordInput, model: 'new_PWD_verify', attrs: { placeholder: 'Passwort wiederholen', maxlength: 128, autocomplete: "off", class: "w-full" }}
  ]
  const miscFields = []
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
        miscForm.value = form.value.misc
        delete form.value.misc
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
        <form-element-group v-model="form" :fields="fields" class="space-y-2" />
        <template v-if="miscFields && miscFields.length">
          <divider>Zusatzinformationen</divider>
          <form-element-group v-model="miscForm" :fields="miscFields" class="space-y-2" />
        </template>
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          {{ form.id ? 'Daten übernehmen' : 'User anlegen' }}
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>