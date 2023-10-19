<script setup>
  import { Sortable, Pagination, FormSwitch, Confirm } from "vx-vue"
  import FilterForm from "@/components/views/articles/FilterForm.vue"
  import Headline from "@/components/app/Headline.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { ref, computed, onMounted } from "vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { storeSort, getSort } from "@/util/storeSort"

  const emit = defineEmits(['notify','fetch-error'])
  const cols = [
    { label: "Kategorie", sortable: true, prop: "catId" },
    { label: "Titel", sortable: true, prop: "title" },
    { label: "Pub", sortable: true, prop: "pub" },
    { label: "*", sortable: true, prop: "marked" },
    { label: "Artikeldatum", sortable: true, prop: "date" },
    { label: "Anzeige von", sortable: true, prop: "from" },
    { label: "Anzeige bis", sortable: true, prop: "until" },
    { label: "Sortierziffer", sortable: true, prop: "sort" },
    { label: "Angelegt/aktualisiert", sortable: true, prop: "updated" },
    { label: "", prop: "action" }
  ]
  const doFetch = vxFetch(emit)
  const articles = ref([])
  const categories = ref([])
  const paginated = ref({ page: 1, entriesPerPage: 20 })
  const filter = ref({ cat: 0, title: '' })
  const filteredArticles = computed(() => {
    const titleFilter = filter.value.title.toLowerCase()
    return articles.value.filter(item => (!filter.value.cat || filter.value.cat === item.catId) && (!titleFilter || item.title.toLowerCase().indexOf(titleFilter) !== -1))
  })
  const confirm = ref(null)
  const del = article => {
    confirm.value.open('Artikel löschen', `'${ article.title }' wirklich löschen?`).then(async () => {
      const response = (await doFetch('article/' + article.id).delete().json()).data.value || {}
      if (response.success) {
        articles.value.splice(articles.value.findIndex(item => article.id === item.id), 1)
      }
      emit('notify', response)
    }).catch(() => {})
  }
  const publish = async row => {
    const response = (await doFetch(`article/${row.id}/${(!row.pub ? 'publish' : 'unpublish')}`).put().json()).data.value || {}
    if(response.success) {
      row.pub = !row.pub
    }
    emit('notify', response)
  }
  onMounted(async () => {
    const response = (await doFetch('articles').json()).data.value || {}
    articles.value = response.articles || []
    categories.value = response.categories || []
    categories.value.forEach(item => item.key = item.id)
  })
</script>

<template>
  <teleport to="#tools">
    <headline><span>Artikel</span>
      <button
          class="icon-link !text-vxvue-700 border-transparent !hover:border-vxvue-700"
          @click="$router.push({ name: 'articleEdit' })"
      >
        <plus-icon class="w-5 h-5" />
      </button>
    </headline>
  </teleport>

  <div class="flex justify-between items-center h-16">
    <filter-form v-model="filter" :options="{ categories: [ { key: 0, label: '(Alle Kategorien)' }, ...categories ] }" />
    <pagination
        class="w-1/4"
        v-model:page="paginated.page"
        :total="filteredArticles.length"
        :per-page="paginated.entriesPerPage"
        next-text=""
        prev-text=""
        marker-position="below"
    />
  </div>
  <sortable
      :rows="filteredArticles"
      :columns="cols"
      :sort-prop="getSort().prop"
      :sort-direction="getSort().dir"
      :offset="(paginated.page - 1) * paginated.entriesPerPage"
      :count="paginated.entriesPerPage"
      @after-sort="storeSort"
  >
    <template v-slot:catId="slotProps">
      {{ categories.find(c => c.id === slotProps.row.catId).label }}
    </template>
    <template v-slot:pub="slotProps">
      <form-switch :model-value="slotProps.row.pub" @update:model-value="publish(slotProps.row)" />
    </template>
    <template v-slot:marked="slotProps">
      <input type="checkbox" class="form-checkbox text-slate-500" disabled="disabled" :checked="slotProps.row.marked">
    </template>
    <template v-slot:action="slotProps">
      <div class="flex justify-end items-center space-x-1">
        <router-link :to="{ name: 'articleEdit', params: { id: slotProps.row.id } }" class="icon-link tooltip" data-tooltip="Bearbeiten">
          <pencil-square-icon class="w-5 h-5" />
        </router-link>
        <button class="icon-link tooltip" data-tooltip="Löschen" @click="del(slotProps.row)">
          <trash-icon class="w-5 h-5" />
        </button>
      </div>
    </template>
  </sortable>

  <confirm
      ref="confirm"
      header-class="text-white bg-error"
      :buttons="[
        { label: 'Löschen!', value: true, class: 'button alert' },
        { label: 'Abbrechen', value: false, class: 'button cancel' }
      ]"
  />
</template>
