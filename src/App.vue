<script setup>
  import { MessageToast } from "vx-vue"
  import MainMenu from "@/components/app/MainMenu.vue"
  import AccountInfo from "@/components/app/AccountInfo.vue"
  import Headerbar from "@/components/app/Headerbar.vue"
  import Logo from "@/components/misc/logo.vue"
  import { Bars3Icon } from '@heroicons/vue/24/solid'
  import { computed, ref } from "vue"
  import router from "@/router"

  const sideBarExpanded = ref(true)
  const user = ref({})
  const toast = ref({})
  const isNotLoginView = computed(() => router.currentRoute.value.name !== undefined && ['login', 'reset-password'].indexOf(router.currentRoute.value.name) === -1)
  const authenticate = e => {
    if (!e) {
      sessionStorage.removeItem("currentUser")
      sessionStorage.removeItem("bearerToken")
      user.value = {}
      router.push({ name: 'login' })
    }
    else {
      sessionStorage.setItem("currentUser", JSON.stringify(e.user))
      router.push({ name: 'profile' })
      user.value = e.user
    }
  }
  const notify = data => {
    if (data.message) {
      toast.value = {
        active: true,
        message: data.message,
        css: data.success ? 'bg-green-700 text-white' : 'bg-red-700 text-white',
        timeout: data.timeout !== undefined ? data.timeout : 5000
      }
    }
  }
  const handleFetchError = response => {
    if (response.status === 401) {
      notify({ message: 'Authentifizierung fehlgeschlagen. Erneute Anmeldung erforderlich.' })
      router.replace({ name: 'login' })
    }
    else {
      notify({ message: `${response.status}: ${response.statusText}.`})
    }
  }
  const currentUser = sessionStorage.getItem("currentUser")
  if (currentUser) {
    user.value = JSON.parse(currentUser)
  }
  else {
    user.value = {}
    router.push({ name: 'login' })
  }
</script>
<template>
  <div class="flex w-full">
    <div :class="['min-h-screen flex flex-col transition-all duration-100 flex-shrink-0', sideBarExpanded ? 'w-72' : 'w-16']" v-if="isNotLoginView">
      <div class="flex overflow-y-auto flex-col flex-grow bg-vxvue">
        <div class="flex items-end pr-2 pb-2 pl-4 space-x-2 h-24 bg-vxvue-600">
          <a href="#" @click.prevent="sideBarExpanded = !sideBarExpanded"><bars3-icon class="flex-shrink-0 w-8 h-8 text-white" /></a>
          <logo class="w-44 text-vxvue-500" v-if="sideBarExpanded" />
        </div>
        <div class="flex flex-col flex-1">
          <main-menu class="flex-1 py-6 px-2 space-y-1" :expanded="sideBarExpanded" />
        </div>
        <div class="p-4 h-32 border-t border-t-white">
          <account-info @authenticate="authenticate" :user="user" :expanded="sideBarExpanded" />
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 min-h-screen">
      <div class="flex flex-1 items-end px-8 pb-2 h-24 bg-white border-b shadow border-slate-500/10" v-if="isNotLoginView">
        <headerbar />
      </div>
      <div :class="['overflow-hidden', !isNotLoginView ? 'h-screen' : 'h-[calc(100vh-var(--header-height))]']">
        <main class="flex overflow-y-auto flex-col flex-1 w-full h-full">
          <div :class="[{'px-8 pt-6': isNotLoginView }]">
            <div>
              <router-view
                  @notify="notify"
                  @authenticate="authenticate"
                  @fetch-error="handleFetchError"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>

  <message-toast
      :active="toast.active"
      :class="toast.css"
      :message="toast.message"
      :timeout="toast.timeout"
      @close="toast.active = false"
      @timeout="toast.active = false"
  />
</template>