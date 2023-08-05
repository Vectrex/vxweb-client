<script setup>
  import PasswordInput from "@/components/vx-vue/password-input.vue"
  import SubmitButton from "@/components/misc/submit-button.vue"
  import Logo from "@/components/misc/logo.vue"
  import { HomeIcon } from '@heroicons/vue/20/solid'
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['authenticate', 'notify'])
  const form = ref({ username: '', password: '' })
  const busy = ref(false)
  const submit = async () => {
    if (form.value.username.trim() && form.value.password.trim()) {
      busy.value = true
      const { data } = await vxFetch("login").post(JSON.stringify(form.value)).json()
      busy.value = false
      if(data.value.bearerToken) {
        sessionStorage.setItem('bearerToken', data.value.bearerToken)
        emit('authenticate', data.value)
      }
      else {
        emit('notify', data.value)
      }
    }
  }
  const getWindow = () => window
</script>

<template>
  <div class="min-h-screen bg-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

    <transition name="appear" appear>
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl shadow ring-1 ring-black ring-opacity-5" @keydown.enter="submit">

        <div class="bg-vxvue px-10 pb-0 pt-16 text-white flex space-x-2 items-baseline rounded-t">
          <logo class="w-1/2" />
          <span class="text-2xl">Administration</span>
        </div>

        <div class="bg-white py-8 px-4 sm:px-10 space-y-4">
          <input v-model="form.username" type="text" class="form-input w-full" placeholder="Username" />
          <password-input v-model="form.password" class="w-full" placeholder="Passwort" />

          <div class="flex justify-between items-center">
            <submit-button :busy="busy" @submit="submit">Anmelden</submit-button>
            <span class="flex space-x-1">
              <home-icon class="w-5 h-5"/>
              <a :href="getWindow().location.protocol + '//' + getWindow().location.host" class="link text-rose-600 hover:text-rose-500">
                {{ getWindow().location.host }}
              </a>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>