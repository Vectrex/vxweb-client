<script setup>
  import { Confirm, Sortable } from "vx-vue"
  import Headline from "@/components/app/Headline.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { storeSort, getSort } from "@/util/storeSort"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref, onMounted } from "vue"

  const emit = defineEmits(['notify', 'fetch-error'])
  const cols = [
    { label: "Alias/Titel", sortable: true, prop: "alias" },
    { label: "Datei", sortable: true, prop: "template" },
    { label: "Inhalt", prop: "contents" },
    { label: "letzte Änderung", sortable: true, prop: "updated" },
    { label: "#Rev", sortable: true, prop: "revisionCount" },
    { label: "", prop: "action" }
  ]
  const pages = ref([])
  const confirm = ref(null)
  const doFetch = vxFetch(emit)

  onMounted(async () => {
    pages.value = (await doFetch('pages').json()).data.value || []
  })
  const del = id => {
    confirm.value.open('Seite löschen', "Soll die Seite mit allen Revisionen wirklich gelöscht werden?").then(async () => {
      const response = (await doFetch('page/' + id).delete().json()).data.value
      if (response.success) {
        pages.value.splice(pages.value.findIndex(item => id === item.id), 1)
      }
      emit('notify', response)
    }).catch(() => {})
  }
</script>

<template>
  <teleport to="#tools">
    <headline>
      <span>{{ $route.meta?.heading }}</span>
      <button
          class="icon-link !text-vxvue-700 border-transparent !hover:border-vxvue-700"
          @click="$router.push({ name: 'pageEdit' })"
      >
        <plus-icon class="w-5 h-5" />
      </button>
    </headline>
  </teleport>

  <sortable
      :rows="pages"
      :columns="cols"
      :sort-prop="getSort().prop"
      :sort-direction="getSort().dir"
      key-property="id"
      @after-sort="storeSort"
  >
    <template v-slot:action="slotProps">
      <div class="flex justify-end space-x-2">
        <router-link :to="{ name: 'pageEdit', params: { id: slotProps.row.id }}" class="icon-link" data-tooltip="Bearbeiten">
          <PencilSquareIcon class="w-5 h-5"/>
        </router-link>
        <button class="icon-link" data-tooltip="Löschen" @click="del(slotProps.row.id)">
          <TrashIcon class="w-5 h-5" />
        </button>
      </div>
    </template>
  </sortable>

  <teleport to="body">
    <confirm
        ref="confirm"
        header-class="text-white bg-error"
        :buttons="[
            { label: 'Löschen!', value: true, class: 'button alert' },
            { label: 'Abbrechen', value: false, class: 'button cancel' }
          ]"
    />
  </teleport>
</template>