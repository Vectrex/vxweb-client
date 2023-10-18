<script setup>
  import { Tabs } from "vx-vue"
  import Headline from "@/components/app/Headline.vue"
  import ArticleForm from "@/components/views/articles/ArticleForm.vue"
  import ArticleFiles from "@/components/views/articles/ArticleFiles.vue"
  import LinkedFiles from "@/components/views/articles/LinkedFiles.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import router from "@/router"
  import { computed, onMounted, ref } from "vue"

  const emit = defineEmits(['notify', 'fetch-error'])
  const props = defineProps({ id: [String, Number], sectionId: [String, Number], section: [String, Number] })
  const tabsItems = ref({ items: [
      { section: 'edit', name: 'Artikel' },
      { section: 'files', name: 'Verlinkte Dateien', badge: null },
      { section: 'sort', name: 'Sortierung und Sichtbarkeit verlinkter Dateien' },
  ]})
  const disabledTabs = computed(() => {
    let items = tabsItems.value.items
    items[1].disabled = items[2].disabled = !props.id
    return items
  })
  const activeTab = computed(() => {
      return router.currentRoute.value.params.section || 'edit'
  })
  const doFetch = vxFetch(emit)
  const getLinkedFiles = async () => {
    if (props.id) {
      const response = (await doFetch('article/' + props.id + '/linked-files').json()).data.value || []
      tabsItems.value.items[1].badge = response.length || 0
    }
  }
  onMounted(getLinkedFiles)
</script>

<template>
  <teleport to="#tools">
    <headline><span>Artikel {{ id ? 'bearbeiten' : 'anlegen' }}</span></headline>
  </teleport>

  <div class="mb-4">
    <tabs
      :items="disabledTabs"
      :active-index="tabsItems.items.findIndex(item => item.section === activeTab)"
      @update:active-index="router.push({ name: 'articleEdit', params: { id: id, section: tabsItems.items[$event].section }})"
    />
  </div>
  <div v-if="activeTab === 'edit'">
    <article-form
        :id="id"
        @response-received="emit('notify', $event)"
        @fetch-error="emit('fetch-error', $event)"
    />
  </div>
  <div v-if="activeTab === 'files' && id">
    <article-files
        :article-id="id"
        :selected-folder="$route.params.sectionId"
        @update-linked="getLinkedFiles"
        @notify="emit('notify', $event)"
        @fetch-error="emit('fetch-error', $event)"
    />
  </div>
  <div v-if="activeTab === 'sort' && id">
    <linked-files
        :article-id="id"
        @update-linked="getLinkedFiles"
        @goto-folder="router.push( { name: 'articleEdit', params: { id: id, section: 'files', sectionId: $event.id }})"
        @fetch-error="emit('fetch-error', $event)"
    />
  </div>
</template>