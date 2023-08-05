<script setup>
  import SubmitButton from "@/components/misc/submit-button.vue"
  import Tiptap from "@/components/misc/tiptap.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref, watch } from "vue"

  const emit = defineEmits(['responseReceived', 'openFileManager'])
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
  const submit = async () => {
    busy.value = true
    const response = (await vxFetch('page/' + (props.id || ''))[props.id ? 'put' : 'post'](JSON.stringify(form.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit('response-received', response)
  }
  watch(() => props.initData, v => form.value = v || {}, { immediate: true })
  defineExpose({ tiptap })
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center flex-wrap">
      <label
          for="alias-input"
          :class="['required', { 'text-error': errors.alias }]"
      >Eindeutiger Name</label>
      <input id="alias-input"
           :value="form.alias"
           @input="form.alias = $event.target.value.toUpperCase()"
           class="form-input w-full"
           :disabled="id" maxlength="64"
      >
      <p v-if="errors.alias" class="text-sm text-error">{{ errors.alias }}</p>
    </div>

    <div class="flex items-center flex-wrap" v-for="element in elements" :key="element.model">
      <label :for="element.model" :class="{ required: element.required, 'text-error': errors[element.model] }">{{ element.label }}</label>
      <input
          v-if="['text', 'number'].indexOf(element.type) !== -1"
          :id="element.model"
          v-model="form[element.model]"
          :type="element.type"
          class="form-input w-full"
          v-bind="element.attrs"
      />
      <textarea
          v-else-if="element.type === 'textarea'"
          :id="element.model"
          v-model="form[element.model]"
          class="form-textarea w-full"
      />
    </div>
    <div class="flex items-center flex-wrap">
      <label for="markup" :class="['required', { 'text-error': errors.markup }]">Inhalt</label>
      <tiptap
          v-model="form.markup"
          ref="tiptap"
          id="markup"
          class="w-full"
          @open-file-manager="emit('openFileManager')"
      />
    </div>
    <submit-button :busy="busy" @submit="submit">Änderungen speichern</submit-button>
  </div>
</template>