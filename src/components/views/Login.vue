<script setup>
  import { Modal, PasswordInput, SubmitButton, VFocus, VFloatingLabel } from "vx-vue"
  import Logo from "@/components/misc/logo.vue"
  import { HomeIcon, XMarkIcon } from '@heroicons/vue/20/solid'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['authenticate', 'notify'])
  const form = ref({ username: '', password: '' })
  const email = ref('')
  const busy = ref(false)
  const showPasswordForgotten = ref(false)
  const doFetch = vxFetch()
  const disablePasswordReset = JSON.parse((import.meta.env.VITE_DISABLE_PASSWORD_RESET || 'true').toLowerCase())

  const submit = async () => {
    if (form.value.username && form.value.password) {
      busy.value = true
      const response = (await doFetch("login").post(JSON.stringify(form.value)).json()).data.value
      busy.value = false
      if(response.bearerToken) {
        sessionStorage.setItem('bearerToken', response.bearerToken)
        emit('authenticate', response)
      }
      else {
        emit('notify', response)
      }
    }
  }
  const showDialog = () => {
    showPasswordForgotten.value = true
    email.value = ''
  }
  const hideDialog = () => {
    showPasswordForgotten.value = false
  }
  const requestPassword = async () => {
    if(/[^@]+@[^@]/.test(email.value)) {
      busy.value = true
      const response = (await doFetch("request-password").put(JSON.stringify({ email: email.value })).json()).data.value
      if (!response.success) {
        emit('notify', response)
      }
      else {
        emit('notify', { ...response, timeout: 0 })
      }
      busy.value = false
      hideDialog()
    }
  }
  const getWindow = () => window
</script>

<template>
  <div class="flex flex-col justify-center py-12 min-h-screen sm:px-6 lg:px-8 bg-slate-200">
    <transition name="appear" appear>
      <div class="mt-8 ring-1 ring-black/5 shadow-sm sm:mx-auto sm:w-full sm:max-w-xl" @keydown.enter="submit">
        <div class="flex items-baseline px-10 pt-16 pb-0 space-x-2 text-white rounded-t bg-vxvue">
          <logo class="w-1/2" />
          <span class="text-2xl">Administration</span>
        </div>

        <div class="py-8 px-4 space-y-4 bg-white sm:px-10">
          <input v-model.trim="form.username" v-floating-label class="w-full form-input" placeholder="Username">
          <password-input v-model.trim="form.password" v-floating-label class="w-full" placeholder="Passwort" />

          <div class="flex justify-between items-center">
            <submit-button :busy="busy" theme="success" class="button" @submit="submit">
              Anmelden
            </submit-button>
            <button v-if="!disablePasswordReset" class="text-rose-600 hover:text-rose-500 link" @click="showDialog">
              Passwort vergessen?
            </button>
            <span v-if="!getWindow().location.host.match(/^localhost/)" class="flex space-x-1">
              <home-icon class="size-5" />
              <a :href="getWindow().location.protocol + '//' + getWindow().location.host" class="text-rose-600 hover:text-rose-500 link">
                {{ getWindow().location.host }}
              </a>
            </span>
          </div>
        </div>
      </div>
    </transition>
    <modal :show="showPasswordForgotten" container-class="w-full lg:w-1/2 xl:w-1/4" @clicked-outside="hideDialog">
      <template #title>
        <div class="flex fixed justify-between items-center px-4 w-full h-16 bg-vxvue-500">
          <span class="text-xl font-bold text-white">Passwort vergessen?</span>
          <button @click="hideDialog">
            <x-mark-icon class="size-5 text-white" />
          </button>
        </div>
      </template>
      <template #default>
        <div class="py-8 px-4 space-y-4 sm:px-10">
          <input
            v-model.trim="email"
            v-focus
            v-floating-label
            type="text"
            class="w-full form-input"
            placeholder="E-Mail"
            @keydown.enter="requestPassword"
            @keydown.esc="hideDialog"
          >
          <div class="flex justify-center">
            <submit-button :busy="busy" theme="success" class="button" @submit="requestPassword">
              Passwort anfordern
            </submit-button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>