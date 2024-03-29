<script setup>
  import { Confirm, Sortable } from "vx-vue"
  import Headline from "@/components/app/Headline.vue"
  import UserForm from "@/components/views/users/UserForm.vue"
  import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'
  import { ref, onMounted } from "vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { storeSort, getSort } from "@/util/storeSort"

  const emit = defineEmits(['notify', 'fetch-error'])

  const users = ref([])
  const formShown = ref(false)
  const editData = ref({ id: null })
  const deleteRequest = ref(null)
  const doFetch = vxFetch(emit)
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
  const cols = [
    { label: "Username", sortable: true, width: "w-1/4", prop: "username" },
    { label: "Name", sortable: true, width: "w-1/6", prop: "name" },
    { label: "Email", prop: "email" },
    { label: "Gruppe", sortable: true, width: "w-1/6", prop: "alias" },
    { label: "", width: "w-1/12", prop: "action", cssClass: "text-right" }
  ]
  const edit = id => {
    formShown.value = true
    editData.value.id = id
  }
  const handleResponse = e => {
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
  const del = id => {
    deleteRequest.value.open("Benutzer löschen", "Soll der Benutzer wirklich entfernt werden?").then(async () => {
      const response = (await doFetch('users/' + id).delete().json()).data.value || {}
      if (response.id) {
        let ndx = users.value.findIndex(row => row.id === response.id)
        if (ndx !== -1) {
          users.value.splice(ndx, 1)
          emit('notify', { message: 'Benutzer wurde erfolgreich gelöscht.', success: true })
        }
      }
      else {
        emit('notify', { message: response.message })
      }
    }).catch(() => {})
  }
  onMounted(async () => { users.value = (await doFetch('users/init').json()).data.value?.users || [] })
</script>
<template>
  <teleport to="#tools">
    <headline><span>Benutzer</span>
      <button
        class="icon-link !text-vxvue-700 border-transparent !hover:border-vxvue-700"
        @click="edit(null)"
      >
        <plus-icon class="size-5" />
      </button>
    </headline>
  </teleport>

  <div class="grid">
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded">
      <div class="overflow-x-auto">
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
            <div class="flex justify-end space-x-2" v-if="currentUser.username !== slotProps.row.username">
              <a class="icon-link" href="#" @click.prevent="edit(slotProps.row.id)"><PencilSquareIcon class="size-5"/></a>
              <a class="icon-link" href="#" @click.prevent="del(slotProps.row.id)"><TrashIcon class="size-5" /></a>
            </div>
          </template>
        </sortable>
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
          class="fixed right-0 bottom-0 left-0 top-24 z-10 bg-white/75 backdrop-blur-sm"
          v-if="formShown"
          @click.stop="formShown = false"
      />
    </transition>
    <transition name="slide-from-right">
      <user-form
          v-if="formShown"
          @cancel="formShown = false"
          @response-received="handleResponse"
          @fetch-error="emit('fetch-error', $event)"
          :id="editData.id"
          :title="editData.id ? 'Benutzer bearbeiten' : 'Benutzer anlegen'"
          class="fixed right-0 bottom-0 top-24 z-20 bg-white shadow-lg shadow-gray w-sidebar"
      />
    </transition>
  </teleport>

  <teleport to="body">
    <confirm
        ref="deleteRequest"
        header-class="text-white bg-error"
        :buttons="[
            { label: 'Löschen!', value: true, class: 'button alert' },
            { label: 'Abbrechen', value: false, class: 'button cancel' }
          ]"
    />
  </teleport>
</template>