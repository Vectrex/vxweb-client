<script setup>
  import Tiptap from "@/components/misc/tiptap.vue"
  import { SubmitButton } from "vx-vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref, watch } from "vue"

  const emit = defineEmits(['response-received', 'open-file-manager', 'fetch-error'])
  const props = defineProps({ initData: Object, id: [String, Number] })
  const form = ref({})
  const errors = ref({})
  const options = ref({})
  const busy = ref(false)
  const tiptap = ref(null)
  const elements = [
    { type: 'text', model: 'title', label: 'Titel', required: true },
    { type: 'textarea', model: 'description', label: 'Beschreibung' },
    { type: 'textarea', model: 'keywords', label: 'Schlüsselworte' }
  ]
  const doFetch = vxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('page/' + (props.id || ''))[props.id ? 'put' : 'post'](JSON.stringify(form.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit('response-received', response)
  }
  watch(() => props.initData, v => form.value = v || {}, { immediate: true })
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center">
      <label
          for="alias-input"
          :class="['required', { 'text-error': errors.alias }]"
      >Eindeutiger Name</label>
      <input id="alias-input"
           :value="form.alias"
           @input="form.alias = $event.target.value.toUpperCase()"
           class="w-full form-input"
           :disabled="id" maxlength="64"
      >
      <p v-if="errors.alias" class="text-sm text-error">{{ errors.alias }}</p>
    </div>

    <div class="flex flex-wrap items-center" v-for="element in elements" :key="element.model">
      <label :for="element.model" :class="{ required: element.required, 'text-error': errors[element.model] }">{{ element.label }}</label>
      <input
          v-if="['text', 'number'].includes(element.type)"
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
    </div>
    <div class="flex flex-wrap items-center">
      <label for="markup" :class="['required', { 'text-error': errors.markup }]">Inhalt</label>
      <tiptap
          v-model="form.markup"
          ref="tiptap"
          id="markup"
          class="w-full"
          @open-file-manager="emit('openFileManager')"
      />
    </div>
    <submit-button :busy="busy" @submit="submit" theme="success" class="button">Änderungen speichern</submit-button>
  </div>
</template>