<script setup>
  import { Datepicker, FormSelect, FormSwitch, SubmitButton } from 'vx-vue'
  import Tiptap from '@/components/misc/tiptap.vue'
  import { vxFetch } from '@/composables/vxFetch'
  import { useDateFormat } from '@vueuse/core'
  import { onMounted, ref } from 'vue'
  import router from '@/router'

  const emit = defineEmits(['response-received', 'fetch-error'])
  const props = defineProps({ id: { type: [String, Number], default: null }})
  const doFetch = vxFetch(emit)
  const datepickerAttrs = {
    placeholder: 'dd.mm.yyyy',
    class: "w-full",
    dayNames: 'So Mo Di Mi Do Fr Sa'.split(' '),
    startOfWeekIndex: 1,
    inputFormat: 'D.M.YYYY',
    outputFormat: 'D MMMM YYYY'
  }
  const dateFields = [
    { model: 'article_date', default: new Date(), label: 'Artikeldatum', attrs: datepickerAttrs },
    { model: 'display_from', label: 'Anzeige von', attrs: { ...datepickerAttrs, validFrom: new Date() }},
    { model: 'display_until', label: 'Anzeige bis', attrs: {...datepickerAttrs, validFrom: new Date()}}
  ]
  const fields = [
    { type: FormSwitch, model: 'customflags', default: false, label: 'Markiert', attrs: { class: 'ml-2' } },
    { type: FormSelect, model: 'articlecategoriesid', label: 'Kategorie', required: true, attrs: { class: 'w-full', placeholder: '(Kategorie wählen)' } },
    { type: 'text', model: 'headline', label: 'Überschrift/Titel', required: true },
    { type: 'text', model: 'subline', label: 'Unterüberschrift' },
    { type: 'textarea', model: 'teaser', label: 'Anrisstext' },
    { type: Tiptap, model: 'content', label: 'Inhalt', required: true, attrs: { class: 'w-full', fileManagerDisable: true } }
  ]
  const busy = ref(false)
  const options = ref({ articlecategoriesid: [] })
  const form = ref({})
  const errors = ref({})
  onMounted(async ()  => {
    options.value.articlecategoriesid = (await doFetch('article/categories').json()).data.value || []

    if (props.id) {
      const data = (await doFetch('article/' + props.id).json()).data.value || {}
      fields.forEach(item => data[item.model] = item.type === FormSwitch ? Boolean(data[item.model]) : data[item.model])
      form.value = data
      dateFields.forEach(item => form.value[item.model] = form.value[item.model] ? new Date(form.value[item.model]) : null)
    }
    else {
      form.value = Object.fromEntries([...dateFields, ...fields].map(f => [f.model, f.default !== undefined ? f.default : null]))
    }
  })
  const submit = async () => {
      let f = {}
      for (const [key, value] of Object.entries(form.value)) {
        f[key] = value instanceof Date ? useDateFormat(value,'YYYY-MM-DD').value : value
      }
      busy.value = true
      const response = (await doFetch('article/' + (props.id || ''))[props.id ? 'put' : 'post'](JSON.stringify(f)).json()).data.value || {}
      busy.value = false

      errors.value = response.errors || {}
      emit('response-received', { success: response.success, message: response.message })

      if (!props.id) {
        router.replace({ name: 'articleEdit', params: { id: response.id }})
      }
  }
</script>

<template>
  <div class="py-4 space-y-2 max-w-4xl">
    <div class="grid grid-cols-3 gap-2">
      <div v-for="field in dateFields" :key="field.model">
        <label :for="field.model" :class="{ required: field.required, 'text-error': errors[field.model] }">{{ field.label }}</label>
        <datepicker
          :id="field.model"
          v-model="form[field.model]"
          v-bind="field.attrs"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="field in fields" :key="field.model" class="flex flex-wrap items-center">
        <label :for="field.model" :class="{ required: field.required, 'text-error': errors[field.model] }">{{ field.label }}</label>
        <input
          v-if="['text', 'number'].includes(field.type)"
          :id="field.model"
          v-model="form[field.model]"
          :type="field.type"
          class="w-full form-input"
          v-bind="field.attrs"
        >
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.model"
          v-model="form[field.model]"
          class="w-full form-textarea"
        />
        <component
          :is="field.type"
          v-else
          :id="field.model"
          v-model="form[field.model]"
          :options="options[field.model] || []"
          v-bind="field.attrs"
        />
      </div>

      <submit-button :busy="busy" theme="success" class="button" @submit="submit">
        Änderungen speichern
      </submit-button>
    </div>
  </div>
</template>