<script setup>
  import Headline from '@/components/app/Headline.vue'
  import PageForm from '@/components/views/pages/PageForm.vue'
  import RevisionTable from '@/components/views/pages/RevisionTable.vue'
  import { vxFetch } from '@/composables/useVxFetch'
  import { fetchJson } from '@/util/fetchJson'
  import router from '@/router'
  import { onMounted, ref } from 'vue'

  const props = defineProps({ id: { type: [String, Number], default: null }})
  const emit = defineEmits(['notify', 'fetch-error'])
  const form = ref({})
  const revisions = ref([])

  const handleResponse = response => {
    if (response.current) {
      form.value = response.current
    }
    if (response.revisions) {
      revisions.value = response.revisions.map(item => {
        item.firstCreated = new Date(item.firstCreated)
        return item
      })
    }
  }
  const handleFormResponse = response => {
    if (response.revisions) {
      revisions.value = response.revisions.map(item => {
        item.firstCreated = new Date(item.firstCreated)
        return item
      })
    }
    if (response.id && !props.id) {
      router.replace({ name: 'pageEdit', params: { id: response.id }})
    }
    emit('notify', response)
  }
  const activateRevision = async revision => {
    try {
      const response = await fetchJson(vxFetch('revision/' + revision.id + '/activate').put()) || {}
      if (response.success) {
        let active = revisions.value.find(item => item.active === true)
        if (active) {
          active.active = false
        }
        active = revisions.value.find(item => item === revision)
        if (active) {
          active.active = true
        }
        handleResponse(response)
      }
      emit('notify', response)
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  const deleteRevision = async revision => {
    try {
      const response = await fetchJson(vxFetch('revision/' + revision.id).delete()) || {}
      if (response.success) {
        handleResponse(response)
      }
      emit('notify', response)
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  const loadRevision = async revision => {
    try {
      const response = await fetchJson(vxFetch('revision/' + revision.id)) || {}
      if (response.success) handleResponse(response)
    } catch (error) {
      emit('fetch-error', error)
    }
  }
  onMounted(async () => {
    if(props.id) {
      try {
        handleResponse(await fetchJson(vxFetch('page/' + props.id)) || {})
      } catch (error) {
        emit('fetch-error', error)
      }
    }
  })
</script>

<template>
  <teleport defer to="#tools">
    <headline><span>Seite {{ id ? 'bearbeiten' : 'anlegen' }}</span></headline>
  </teleport>
  <div class="flex w-full justify-start space-x-4 pb-4">
    <page-form
      :id="id"
      :init-data="form"
      class="w-full"
      @response-received="handleFormResponse"
      @fetch-error="emit('fetch-error', $event)"
    />
    <div class="h-[calc(100vh-var(--header-height)-1.5rem)] w-1/3 shrink-0 overflow-hidden">
      <revision-table
        :revisions="revisions"
        class="h-full w-full overflow-y-auto"
        @activate-revision="activateRevision"
        @delete-revision="deleteRevision"
        @load-revision="loadRevision"
      />
    </div>
  </div>
</template>