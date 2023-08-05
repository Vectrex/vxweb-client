<script setup>
  import Sortable from "@/components/vx-vue/sortable.vue"
  import Confirm from "@/components/vx-vue/confirm.vue"
  import Headline from "@/components/app/Headline.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { storeSort, getSort } from "@/util/storeSort"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref, onMounted } from "vue"

  const emit = defineEmits(['notify'])
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

  onMounted(async () => {
    const { data } = await vxFetch('pages').json()
    pages.value = data.value
  })
  const del = async id => {
    if(await confirm.value.open('Seite löschen', "Soll die Seite mit allen Revisionen wirklich gelöscht werden?")) {
      const { data } = await vxFetch('page/' + id).delete().json()
      if (data.value?.success) {
        pages.value.splice(pages.value.findIndex(item => id === item.id), 1)
        emit('notify', { message: 'Seite wurde erfolgreich gelöscht.', success: true })
      } else {
        emit('notify', { message: data.value.message || 'Es ist ein Fehler aufgetreten!', success: false })
      }
    }
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
      <div class="flex space-x-2 justify-end">
        <a class="icon-link" href="#" @click.prevent="$router.push({ name: 'pageEdit', params: { id: slotProps.row.id }})"><PencilSquareIcon class="w-5 h-5"/></a>
        <a class="icon-link" href="#" @click.prevent="del(slotProps.row.id)"><TrashIcon class="w-5 h-5" /></a>
      </div>
    </template>
  </sortable>

  <teleport to="body">
    <confirm
        ref="confirm"
        header-class="bg-error text-white"
        :buttons="[
            { label: 'Löschen!', value: true, class: 'button alert' },
            { label: 'Abbrechen', value: false, class: 'button cancel' }
          ]"
    />
  </teleport>
</template>