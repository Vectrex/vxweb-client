<script setup>
  import { Datepicker, FormSelect, FormSwitch, SubmitButton } from "vx-vue"
  import Tiptap from "@/components/misc/tiptap.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { useDateFormat } from "@vueuse/core"
  import { onMounted, ref } from "vue"
  import router from "@/router"

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
  const dateElements = [
    { model: 'article_date', label: 'Artikeldatum', attrs: datepickerAttrs },
    { model: 'display_from', label: 'Anzeige von', attrs: { ...datepickerAttrs, validFrom: new Date() }},
    { model: 'display_until', label: 'Anzeige bis', attrs: {...datepickerAttrs, validFrom: new Date()}}
  ]
  const elements = [
    { type: FormSwitch, model: 'customflags', label: 'Markiert', attrs: { class: 'ml-2' } },
    { type: FormSelect, model: 'articlecategoriesid', label: 'Kategorie', required: true, attrs: { class: 'w-full', disabledLabel: '(Kategorie wählen)' } },
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
      elements.forEach(item => data[item.model] = item.type === FormSwitch ? Boolean(data[item.model]) : data[item.model])
      form.value = data
      dateElements.forEach(item => form.value[item.model] = form.value[item.model] ? new Date(form.value[item.model]) : null)
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
      <div v-for="element in dateElements" :key="element.model">
        <label :for="element.model" :class="{ required: element.required, 'text-error': errors[element.model] }">{{ element.label }}</label>
        <datepicker
          :id="element.model"
          v-model="form[element.model]"
          v-bind="element.attrs"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div v-for="element in elements" :key="element.model" class="flex flex-wrap items-center">
        <label :for="element.model" :class="{ required: element.required, 'text-error': errors[element.model] }">{{ element.label }}</label>
        <input
          v-if="['text', 'number'].includes(element.type)"
          :id="element.model"
          v-model="form[element.model]"
          :type="element.type"
          class="w-full form-input"
          v-bind="element.attrs"
        >
        <textarea
          v-else-if="element.type === 'textarea'"
          :id="element.model"
          v-model="form[element.model]"
          class="w-full form-textarea"
        />
        <component
          :is="element.type"
          v-else
          :id="element.model"
          v-model="form[element.model]"
          :options="options[element.model] || []"
          v-bind="element.attrs"
        />
      </div>

      <submit-button :busy="busy" theme="success" class="button" @submit="submit">
        Änderungen speichern
      </submit-button>
    </div>
  </div>
</template>