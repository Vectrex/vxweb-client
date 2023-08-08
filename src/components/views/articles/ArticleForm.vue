<script setup>
  import DatePicker from "@/components/vx-vue/datepicker.vue"
  import FormSelect from "@/components/vx-vue/form-select.vue"
  import FormSwitch from "@/components/vx-vue/form-switch.vue"
  import Tiptap from "@/components/misc/tiptap.vue"
  import SubmitButton from "@/components/misc/submit-button.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { useDateFormat } from "@vueuse/core"
  import { onMounted, ref } from "vue"
  import router from "@/router"


  const emit = defineEmits(['response-received'])
  const props = defineProps({ id: [Number, String]})
  const datepickerAttrs = {
    placeholder: 'dd.mm.yyyy',
    class: "w-96 w-full",
    dayNames: 'So Mo Di Mi Do Fr Sa'.split(' '),
    startOfWeekIndex: 1,
    inputFormat: 'D.M.YYYY',
    outputFormat: 'D MMMM YYYY'
  }
  const elements = [
    { type: DatePicker, model: 'article_date', label: 'Artikeldatum', attrs: datepickerAttrs },
    { type: DatePicker, model: 'display_from', label: 'Anzeige von', attrs: { ...datepickerAttrs, validFrom: new Date() }},
    { type: DatePicker, model: 'display_until', label: 'Anzeige bis', attrs: {...datepickerAttrs, validFrom: new Date()}},
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
    options.value.articlecategoriesid = (await vxFetch('article/categories').json()).data.value || []
    if (props.id) {
      form.value = (await vxFetch('article/' + props.id).json()).data.value || {}

      elements.forEach(item => {
        if(item.type === DatePicker && form.value[item.model]) {
          form.value[item.model] = new Date(form.value[item.model])
        }
      })
    }
  })
  const submit = async () => {
      let f = {}
      for (const [key, value] of Object.entries(form.value)) {
        f[key] = value instanceof Date ? useDateFormat(value,'YYYY-MM-DD').value : value
      }
      busy.value = true
      const response = (await vxFetch('article/' + (props.id || ''))[props.id ? 'put' : 'post'](JSON.stringify(f)).json()).data.value
      busy.value = false

      errors.value = response.errors || {}
      emit('response-received', { success: response.success, message: response.message })

      if (!props.id) {
        router.replace({ name: 'articleEdit', params: { id: response.id }})
      }
  }
</script>

<template>
  <div class="py-4 max-w-4xl">
    <div class="space-y-2">
      <div class="flex flex-wrap items-center" v-for="element in elements" :key="element.model">
        <label :for="element.model" :class="{ required: element.required, 'text-error': errors[element.model] }">{{ element.label }}</label>
        <input
          v-if="['text', 'number'].indexOf(element.type) !== -1"
          :id="element.model"
          v-model="form[element.model]"
          :type="element.type"
          class="w-full form-input"
          v-bind="element.attrs"
        />
        <textarea
            v-else-if="element.type === 'textarea'"
            :id="element.model"
            v-model="form[element.model]"
            class="w-full form-textarea"
        />
        <component
          v-else
          :is="element.type"
          :id="element.model"
          :options="options[element.model] || []"
          v-model="form[element.model]"
          v-bind="element.attrs"
        />
      </div>

      <submit-button :busy="busy" @submit="submit">Änderungen speichern</submit-button>
    </div>
  </div>
</template>