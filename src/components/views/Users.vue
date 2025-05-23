<script setup>
  import { useAuthStore } from '@/stores/auth'
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
  <teleport defer to="#tools">
    <headline>
      <span>Benutzer</span>
      <button
        class="icon-link text-vxvue-700! border-transparent !hover:border-vxvue-700"
        @click="edit(null)"
      >
        <plus-icon class="size-5" />
      </button>
    </headline>
  </teleport>

  <div class="grid">
    <div class="overflow-hidden rounded-sm ring-1 shadow-sm ring-black/5">
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
          <template #action="{ row }">
            <div v-if="useAuthStore().credentials.user?.username !== row.username" class="flex justify-end space-x-2">
              <button class="icon-link" @click="edit(row.id)">
                <PencilSquareIcon class="size-5" />
              </button>
              <button class="icon-link" @click="del(row.id)">
                <TrashIcon class="size-5" />
              </button>
            </div>
          </template>
        </sortable>
      </div>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        v-if="formShown"
        class="fixed right-0 bottom-0 left-0 top-24 z-10 bg-white/75 backdrop-blur-xs"
        @click.stop="formShown = false"
      />
    </transition>
    <transition name="slide-from-right">
      <user-form
        v-if="formShown"
        :id="editData.id"
        :title="editData.id ? 'Benutzer bearbeiten' : 'Benutzer anlegen'"
        class="fixed right-0 bottom-0 top-24 z-20 bg-white shadow-lg shadow-gray w-sidebar"
        @cancel="formShown = false"
        @response-received="handleResponse"
        @fetch-error="emit('fetch-error', $event)"
      />
    </transition>
  </teleport>

  <teleport to="body">
    <confirm
      ref="deleteRequest"
      header-class="text-white bg-error"
      :buttons="[
        { label: 'Löschen!', value: true, class: 'button bg-error-700 hover:bg-error-600 focus:ring-error-600 text-white' },
        { label: 'Abbrechen', value: false, class: 'button bg-slate-300 hover:bg-slate-200 focus:ring-slate-200 text-slate-800' }
      ]"
    />
  </teleport>
</template>