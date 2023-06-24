<script setup>
  import SubmitButton from "@/components/misc/submit-button.vue"
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import Divider from "@/components/misc/divider.vue"
  import { formatFilesize } from '@/util/format-filesize'
  import { customFetch } from "@/composables/customFetch"
  import { computed, ref, watch } from "vue"

  const props = defineProps({ id: Number })
  const emit = defineEmits(['cancel', 'response-received'])

  const form = ref({})
  const fileInfo = ref({})
  const errors = ref({})
  const busy = ref(false)
  const fields = [
    { model: 'title', label: 'Titel' },
    { model: 'subtitle', label: 'Untertitel' },
    { type: 'textarea', model: 'description', label: 'Beschreibung' },
    { model: 'customsort', label: 'Sortierziffer', attrs: { type: "number" } },
  ]
  const sanitizedForm = computed(() => {
    let sanitized = {}
    for (const [key, value] of Object.entries(form.value)) {
      if(value !== null) {
        sanitized[key] = value
      }
    }
    return sanitized
  })
  watch(() => props.id, async v => {
    const response = (await customFetch('file/' + v).json()).data.value || {}
    form.value = response.form || {}
    fileInfo.value = response.fileInfo || {}
  }, { immediate: true })
  const submit = async () => {
    busy.value = true
    const response = (await customFetch('file/' + props.id).put(JSON.stringify(sanitizedForm.value)).json()).data.value || {}
    busy.value = false
    errors.value = response.errors || {}
    emit(
        'response-received',
        response.success ?
            { success: true, message: response.message, payload: response.form || null } :
            { success: false, message: response.message }
    )
  }
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
      <template #title>{{ fileInfo.name }}</template>
      <template #content>
          <div class="pt-16 pb-4 space-y-2">
              <div>
                  <img :src="fileInfo.thumb" v-if="(fileInfo.mimetype || '').startsWith('image')" class="w-full">
                  <divider class="px-4">Details</divider>
                  <div class="px-4 py-2 space-y-2 text-sm">
                      <span class="w-1/3 inline-block">Typ</span><span class="w-2/3 inline-block">{{ fileInfo.mimetype }}</span>
                      <span class="w-1/3 inline-block">Link</span><span class="w-2/3 inline-block"><a class="link" :href="fileInfo.url" target="_blank">{{ fileInfo.name }}</a></span>
                      <template v-if="fileInfo.cache">
                          <span class="w-1/3 inline-block">Cache</span><span class="w-2/3 inline-block">{{ fileInfo.cache.count }} Dateien, {{ formatFilesize(fileInfo.cache.totalSize) }}</span>
                      </template>
                  </div>
              </div>
              <div>
                  <divider class="px-4">Metadaten</divider>
                  <div v-for="field in fields" class="px-4 py-2 space-y-2">
                      <div>
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
                                  v-bind="field.attrs"
                          />
                          <textarea
                                  v-else-if="field.type === 'textarea'"
                                  class="w-full form-textarea"
                                  :id="field.model + '-' + field.type"
                                  v-model="form[field.model]"
                          />
                          <p v-if="errors[field.model]" class="text-sm text-error">{{ errors[field.model] }}</p>
                      </div>
                  </div>
              </div>
              <div class="px-4">
                  <submit-button :busy="busy" @submit="submit">Daten übernehmen</submit-button>
              </div>
          </div>
      </template>
  </form-dialog>
</template>