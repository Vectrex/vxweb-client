<script setup>
  import Headline from "@/components/app/Headline.vue"
  import PageForm from "@/components/views/pages/PageForm.vue"
  import RevisionTable from "@/components/views/pages/RevisionTable.vue"
  import { customFetch } from "@/composables/customFetch"
  import router from "@/router"
  import { onMounted, ref } from "vue"

  const props = defineProps({ id: [Number, String]})
  const emit = defineEmits(['notify'])
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
    const response = (await customFetch('revision/' + revision.id + '/activate').put().json()).data.value
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
    const response = (await customFetch('revision/' + revision.id).delete().json()).data.value
    if (response.success) {
      handleResponse(response)
    }
    emit('notify', response)
  }
  const loadRevision = async revision => {
    const response = (await customFetch('revision/' + revision.id).json()).data.value
    if (response.success) {
      handleResponse(response)
    }
  }
  onMounted(async () => {
    if(props.id) { handleResponse((await customFetch('page/' + props.id).json()).data.value) }
  })
</script>

<template>
  <teleport to="#tools">
    <headline><span>Seite {{ id ? 'bearbeiten' : 'anlegen' }}</span></headline>
  </teleport>
  <div class="flex w-full space-x-4 justify-start">
    <page-form :init-data="form" class="w-full" @response-received="handleFormResponse" :id="id" />
    <div class="w-1/3 flex-shrink-0 overflow-hidden h-[calc(100vh-var(--header-height)-1.5rem)]">
      <revision-table
          :revisions="revisions" class="w-full h-full overflow-y-auto"
          @activate-revision="activateRevision"
          @delete-revision="deleteRevision"
          @load-revision="loadRevision"
      />
    </div>
  </div>
</template>