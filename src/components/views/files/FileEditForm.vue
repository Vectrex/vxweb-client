<script setup>
  import FormDialog from "@/components/views/shared/FormDialog.vue"
  import Divider from "@/components/misc/divider.vue"
  import { SubmitButton, VFloatingLabel } from "vx-vue"
  import { formatFilesize } from '@/composables/formatFilesize'
  import { vxFetch } from "@/composables/vxFetch"
  import { computed, ref, watch } from "vue"

  const props = defineProps({ id: { type: Number, default: null }})
  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])

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
  const doFetch = vxFetch(emit)
  const submit = async () => {
    busy.value = true
    const response = (await doFetch('file/' + props.id).put(JSON.stringify(sanitizedForm.value)).json()).data.value
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
    const response = (await doFetch('file/' + v).json()).data.value
    if (response) {
      form.value = response.form || {}
      fileInfo.value = response.fileInfo || {}
    }
    else {
      emit('cancel')
    }
  }, { immediate: true })
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
    <template #title>
      {{ fileInfo.name }}
    </template>
    <template #content>
      <div class="pt-16 pb-4 space-y-2">
        <div>
          <img v-if="(fileInfo.mimetype || '').startsWith('image')" :src="fileInfo.thumb" class="w-full pb-4" :alt="fileInfo.name" />
          <divider class="px-4">
            Details
          </divider>
          <div class="py-2 px-4 space-y-2 text-sm">
            <span class="inline-block w-1/3">Typ</span><span class="inline-block w-2/3">{{ fileInfo.mimetype }}</span>
            <template v-if="fileInfo.imageInfo">
              <span class="inline-block w-1/3">Breite/Höhe</span><span class="inline-block w-2/3">{{ fileInfo.imageInfo.w }} x {{ fileInfo.imageInfo.h }}px</span>
            </template>
            <span class="inline-block w-1/3">Link</span><span class="inline-block w-2/3"><a class="link" :href="fileInfo.url" target="_blank">{{ fileInfo.name }}</a></span>
            <template v-if="fileInfo.cache">
              <span class="inline-block w-1/3">Cache</span><span class="inline-block w-2/3">{{ fileInfo.cache.count }} Dateien, {{ formatFilesize(fileInfo.cache.totalSize).formatted.value }}</span>
            </template>
          </div>
        </div>
        <div>
          <divider class="px-4">
            Metadaten
          </divider>
          <div v-for="field in fields" :key="field.model" class="py-2 px-4 space-y-2">
            <div class="relative">
              <input
                v-if="!field.type"
                v-model="form[field.model]"
                v-floating-label="{ invalid: errors[field.model] }"
                :required="field.required"
                :placeholder="field.label"
                class="w-full form-input"
                v-bind="field.attrs"
              >
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="form[field.model]"
                v-floating-label="{ invalid: errors[field.model] }"
                :required="field.required"
                :placeholder="field.label"
                class="w-full form-textarea"
                v-bind="field.attrs"
              />
              <p v-if="errors[field.model]" class="text-sm text-error">
                {{ errors[field.model] }}
              </p>
            </div>
          </div>
        </div>
        <div class="px-4">
          <submit-button :busy="busy" theme="success" class="button" @submit="submit">
            Daten übernehmen
          </submit-button>
        </div>
      </div>
    </template>
  </form-dialog>
</template>