<script setup>
  import Headline from "@/components/app/Headline.vue"
  import PageForm from "@/components/views/pages/PageForm.vue"
  import RevisionTable from "@/components/views/pages/RevisionTable.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import router from "@/router"
  import { onMounted, ref } from "vue"

  const props = defineProps({ id: { type: [String, Number], default: null }})
  const emit = defineEmits(['notify', 'fetch-error'])
  const form = ref({})
  const revisions = ref([])

  const doFetch = vxFetch(emit)
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
    const response = (await doFetch('revision/' + revision.id + '/activate').put().json()).data.value || {}
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
  }
  const deleteRevision = async revision => {
    const response = (await doFetch('revision/' + revision.id).delete().json()).data.value || {}
    if (response.success) {
      handleResponse(response)
    }
    emit('notify', response)
  }
  const loadRevision = async revision => {
    const response = (await doFetch('revision/' + revision.id).json()).data.value || {}
    if (response.success) {
      handleResponse(response)
    }
  }
  onMounted(async () => {
    if(props.id) { handleResponse((await doFetch('page/' + props.id).json()).data.value || {}) }
  })
</script>

<template>
  <teleport defer to="#tools">
    <headline><span>Seite {{ id ? 'bearbeiten' : 'anlegen' }}</span></headline>
  </teleport>
  <div class="flex justify-start pb-4 space-x-4 w-full">
    <page-form
      :id="id"
      :init-data="form"
      class="w-full"
      @response-received="handleFormResponse"
      @fetch-error="emit('fetch-error', $event)"
    />
    <div class="overflow-hidden w-1/3 shrink-0 h-[calc(100vh-var(--header-height)-1.5rem)]">
      <revision-table
        :revisions="revisions"
        class="overflow-y-auto w-full h-full"
        @activate-revision="activateRevision"
        @delete-revision="deleteRevision"
        @load-revision="loadRevision"
      />
    </div>
  </div>
</template>