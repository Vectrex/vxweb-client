<script setup>
  import Sortable from "@/components/vx-vue/sortable.vue"
  import Pagination from "@/components/vx-vue/pagination.vue"
  import FormSwitch from "@/components/vx-vue/form-switch.vue"
  import FilterForm from "@/components/views/articles/FilterForm.vue"
  import Alert from "@/components/vx-vue/alert.vue"
  import Headline from "@/components/app/Headline.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { ref, computed, onMounted } from "vue"
  import { customFetch } from "@/composables/customFetch"
  import { storeSort, getSort } from "@/util/storeSort"

  const emit = defineEmits(['notify'])
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
  const articles = ref([])
  const categories = ref([])
  const paginated = ref({ page: 1, entriesPerPage: 20 })
  const filter = ref({ cat: 0, title: '' })
  const filteredArticles = computed(() => {
    const titleFilter = filter.value.title.toLowerCase()
    return articles.value.filter(item => (!filter.value.cat || filter.value.cat === item.catId) && (!titleFilter || item.title.toLowerCase().indexOf(titleFilter) !== -1))
  })
  const confirm = ref(null)

  onMounted(async () => {
    const { data } = await customFetch('articles').json()
    articles.value = data.value?.articles || []
    categories.value = data.value?.categories || []
    categories.value.forEach(item => item.key = item.id)
  })
  const del = async article => {
    if (await confirm.value.open('Artikel löschen', `'${ article.title }' wirklich löschen?`)) {
      const { data } = await customFetch('article/' + article.id).delete().json()
      if (data.value?.success) {
        articles.value.splice(articles.value.findIndex(item => article.id === item.id), 1)
      }
      emit('notify', data.value);
    }
  }
  const publish = async (row) => {
    row.pub = !row.pub
    const { data } = await customFetch(`article/${row.id}/${(row.pub ? 'publish' : 'unpublish')}`).put().json()
    if(!data.value?.success) {
      row.pub = !row.pub
    }
    emit('notify', data.value)
  }
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

  <div class="h-16 flex items-center justify-between">
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
      <div class="flex items-center space-x-1 justify-end">
        <router-link :to="{ name: 'articleEdit', params: { id: slotProps.row.id } }" class="icon-link tooltip" data-tooltip="Bearbeiten">
          <pencil-square-icon class="h-5 w-5" />
        </router-link>
        <button class="icon-link tooltip" data-tooltip="Löschen" @click="del(slotProps.row)">
          <trash-icon class="h-5 w-5" />
        </button>
      </div>
    </template>
  </sortable>

  <alert
      ref="confirm"
      header-class="bg-error text-white"
      :buttons="[
        { label: 'Löschen!', value: true, class: 'button alert' },
        { label: 'Abbrechen', value: false, class: 'button cancel' }
      ]"
  />
</template>
