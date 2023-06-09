<script setup>
  import Sortable from "@/components/vx-vue/sortable.vue"
  import Alert from "@/components/vx-vue/alert.vue"
  import Headline from "@/components/app/Headline.vue"
  import UserForm from "@/components/views/users/UserForm.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { ref, onMounted } from "vue"
  import { customFetch } from "@/composables/customFetch"
  import { storeSort, getSort } from "@/util/storeSort"

  const emit = defineEmits(['notify'])

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
  const cols = [
    { label: "Username", sortable: true, width: "w-1/4", prop: "username" },
    { label: "Name", sortable: true, width: "w-1/6", prop: "name" },
    { label: "Email", prop: "email" },
    { label: "Gruppe", sortable: true, width: "w-1/6", prop: "alias" },
    { label: "", width: "w-1/12", prop: "action", cssClass: "text-right" }
  ]

  const users = ref([])
  const formShown = ref(false)
  const editData = ref({ id: null })
  const confirm = ref(null)

  onMounted(async () => {
    const { data } = await customFetch('users/init').json()
    users.value = data.value?.users || []
  })
  const edit = id => {
    formShown.value = true
    editData.value.id = id
  }
  const handleResponse = (e) => {
    if (e.payload?.id) {
      let ndx = users.value.findIndex(item => item.id === e.payload.id)
      if (ndx !== -1) {
        users.value[ndx] = e.payload
      }
      else {
        users.value.push(e.payload)
      }
    }
    emit('notify', e)
  }
  const del = async id => {
    if (await confirm.value.open("Benutzer löschen", "Soll der Benutzer wirklich entfernt werden?")) {
      const { data } = await customFetch('users/' + id).delete().json()
      if (data.value?.id) {
        let ndx = users.value.findIndex(row => row.id === data.value.id)
        if (ndx !== -1) {
          users.value.splice(ndx, 1)
          emit('notify', { message: 'Benutzer wurde erfolgreich gelöscht.', success: true })
        }
      }
      else {
        emit('notify', { message: data.value.message || 'Es ist ein Fehler aufgetreten!', success: false })
      }
    }
  }
</script>

<template>
  <teleport to="#tools">
    <headline><span>Benutzer</span>
      <button
        class="icon-link !text-vxvue-700 border-transparent !hover:border-vxvue-700"
        type="button"
        @click="edit(null)"
      >
        <plus-icon class="w-5 h-5" />
      </button>
    </headline>
  </teleport>
  <div class="rounded overflow-hidden">
    <sortable
        :rows="users"
        :columns="cols"
        :sort-prop="getSort().prop"
        :sort-direction="getSort().dir"
        class="w-full"
        key-property="id"
        @after-sort="storeSort"
    >
      <template v-slot:action="slotProps">
        <div class="flex space-x-2 justify-end" v-if="currentUser.username !== slotProps.row.username">
          <a class="icon-link" href="#" @click.prevent="edit(slotProps.row.id)"><PencilSquareIcon class="w-5 h-5"/></a>
          <a class="icon-link" href="#" @click.prevent="del(slotProps.row.id)"><TrashIcon class="w-5 h-5" /></a>
        </div>
      </template>
    </sortable>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
          class="z-10 fixed right-0 bottom-0 top-24 left-0 bg-white/75 backdrop-blur-sm"
          v-if="formShown"
          @click.stop="formShown = false"
      />
    </transition>
    <transition name="slide-from-right">
      <user-form
          v-if="formShown"
          @cancel="formShown = false"
          @response-received="handleResponse"
          :id="editData.id"
          :title="editData.id ? 'Benutzer bearbeiten' : 'Benutzer anlegen'"
          class="z-20 fixed top-24 bottom-0 shadow-gray shadow-lg bg-white w-sidebar right-0"
      />
    </transition>
  </teleport>

  <teleport to="body">
    <alert
        ref="confirm"
        header-class="bg-error text-white"
        :buttons="[
            { label: 'Löschen!', value: true, 'class': 'button alert' },
            { label: 'Abbrechen', value: false, 'class': 'button cancel' }
          ]"
    />
  </teleport>
</template>