<script setup>
  import Headline from "@/components/app/Headline.vue"
  import PageForm from "@/components/views/pages/PageForm.vue"
  import RevisionTable from "@/components/views/pages/RevisionTable.vue"
  import Modal from "@/components/vx-vue/modal.vue"
  import PageFiles from "@/components/views/pages/PageFiles.vue"
  import { XMarkIcon } from "@heroicons/vue/24/solid"
  import { customFetch } from "@/composables/customFetch"
  import router from "@/router"
  import { onMounted, ref } from "vue"

  const props = defineProps({ id: [Number, String]})
  const emit = defineEmits(['notify'])
  const form = ref({})
  const showFm = ref(false)
  const revisions = ref([])
  const editForm = ref(null)

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
    const response = (await customFetch('revision/' + revision.id + '/activate').put().json()).data.value || {}
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
    const response = (await customFetch('revision/' + revision.id).delete().json()).data.value || {}
    if (response.success) {
      handleResponse(response)
    }
    emit('notify', response)
  }
  const loadRevision = async revision => {
    const response = (await customFetch('revision/' + revision.id).json()).data.value || {}
    if (response.success) {
      handleResponse(response)
    }
  }
  const insertPickedFile = obj => { editForm.value.tiptap[0].injectImage(obj); showFm.value = false }

  onMounted(async () => {
    if(props.id) { handleResponse((await customFetch('page/' + props.id).json()).data.value || {}) }
  })
</script>

<template>
  <teleport to="#tools">
    <headline><span>Seite {{ id ? 'bearbeiten' : 'anlegen' }}</span></headline>
  </teleport>
  <div class="flex w-full space-x-4 justify-start">
    <page-form :init-data="form" class="w-full" @response-received="handleFormResponse" :id="id" ref="editForm" @open-file-manager="showFm = true" />
    <div class="w-1/3 flex-shrink-0 overflow-hidden h-[calc(100vh-var(--header-height)-1.5rem)]">
      <revision-table
          :revisions="revisions" class="w-full h-full overflow-y-auto"
          @activate-revision="activateRevision"
          @delete-revision="deleteRevision"
          @load-revision="loadRevision"
      />
    </div>
  </div>
  <modal :show="showFm">
    <template #title>
      <div class="fixed flex w-full justify-between items-center bg-vxvue-500 h-16 px-4">
        <span class="text-2xl text-white">Datei auswählen...</span>
        <a href="#" @click.prevent="showFm = false"><x-mark-icon class="w-5 h-5 text-white"/></a>
      </div>
    </template>
    <template #default>
      <div class="pt-16 px-4">
        <page-files @pick-file="insertPickedFile" />
      </div>
    </template>
  </modal>
</template>