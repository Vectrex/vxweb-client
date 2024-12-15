<script setup>
  import { MessageToast } from "vx-vue"
  import { computed, ref } from "vue"
  import router from "@/router"

  const user = ref({})
  const toast = ref({})
  const layout = computed(() => router.currentRoute.value?.meta.layout || 'DefaultLayout')

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
        css: data.success ? 'bg-success-700 text-success-100' : 'bg-error-700 text-error-100',
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
  user.value = JSON.parse(sessionStorage.getItem("currentUser") || '{}')
</script>

<template>
  <component :is="layout" :user="user" @authenticate="authenticate">
    <router-view @notify="notify" @authenticate="authenticate" @fetch-error="handleFetchError" />
  </component>

  <message-toast
      :active="toast.active"
      :class="toast.css"
      :message="toast.message"
      :timeout="toast.timeout"
      @close="toast.active = false"
      @timeout="toast.active = false"
  />
</template>