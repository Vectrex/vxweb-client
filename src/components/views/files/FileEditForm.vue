<script setup>
  import FormDialog from '@/components/views/shared/FormDialog.vue'
  import FormElementGroup from '@/components/views/shared/FormElementGroup.vue'
  import Divider from '@/components/misc/divider.vue'
  import { SubmitButton } from 'vx-vue'
  import { useFormatFilesize } from '@/composables/useFormatFilesize'
  import { vxFetch } from '@/composables/useVxFetch'
  import { fetchJson } from '@/util/fetchJson'
  import { computed, ref, watch } from 'vue'

  const props = defineProps({ id: { type: Number, default: null }})
  const emit = defineEmits(['cancel', 'response-received', 'fetch-error'])

  const form = ref({})
  const fileInfo = ref({})
  const errors = ref({})
  const busy = ref(false)
  const fields = [
    { model: 'title', attrs: { placeholder: 'Titel', class: 'w-full' }},
    { model: 'subtitle', attrs: { placeholder: 'Untertitel', class: 'w-full' }},
    { model: 'description', type: 'textarea', label: 'Beschreibung', attrs: { placeholder: 'Beschreibung', class: 'w-full' }},
    { model: 'customsort', attrs: { placeholder: 'Sortierziffer', type: 'number', class: 'w-full' }},
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
  const submit = async () => {
    busy.value = true
    try {
      const response = await fetchJson(vxFetch('file/' + props.id).put(sanitizedForm.value))
      if(!response) {
        emit('cancel')
      }
      else {
        errors.value = response.errors || {}
        emit('response-received', { ...response, payload: response.form || null })
      }
    } catch (error) {
      emit('fetch-error', error)
    } finally {
      busy.value = false
    }
  }
  watch(() => props.id, async v => {
    try {
      const response = await fetchJson(vxFetch('file/' + v))
      if (response) {
        form.value = response.form || Object.fromEntries(fields.map(f => [f.model, f.default !== undefined ? f.default : null]))
        fileInfo.value = response.fileInfo || {}
      }
      else {
        emit('cancel')
      }
    } catch (error) {
      emit('fetch-error', error)
    }
  }, { immediate: true })
</script>

<template>
  <form-dialog @cancel="emit('cancel')">
    <template #title>
      {{ fileInfo.name }}
    </template>
    <template #content>
      <div class="p-4 space-y-2">
        <div>
          <img
            v-if="(fileInfo.mimetype || '').startsWith('image')"
            :src="fileInfo.thumb"
            :alt="fileInfo.name"
            class="pb-4 w-full"
          >
          <divider>Details</divider>
          <div class="py-2 space-y-2 text-sm">
            <span class="inline-block w-1/3">Typ</span><span class="inline-block w-2/3">{{ fileInfo.mimetype }}</span>
            <template v-if="fileInfo.imageInfo">
              <span class="inline-block w-1/3">Breite/Höhe</span><span class="inline-block w-2/3">{{ fileInfo.imageInfo.w }} x {{ fileInfo.imageInfo.h }}px</span>
            </template>
            <span class="inline-block w-1/3">Link</span><span class="inline-block w-2/3"><a class="link" :href="fileInfo.url" target="_blank">{{ fileInfo.name }}</a></span>
            <template v-if="fileInfo.cache">
              <span class="inline-block w-1/3">Cache</span><span class="inline-block w-2/3">{{ fileInfo.cache.count }} Dateien, {{
                useFormatFilesize(fileInfo.cache.totalSize).formatted.value
              }}</span>
            </template>
          </div>
        </div>
        <div>
          <divider>
            Metadaten
          </divider>
          <form-element-group v-model="form" :fields="fields" class="py-2 space-y-2" />
        </div>
        <submit-button :busy="busy" theme="success" class="button" @submit="submit">
          Daten übernehmen
        </submit-button>
      </div>
    </template>
  </form-dialog>
</template>