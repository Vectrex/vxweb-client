<script setup>
  import { useAuthStore } from '@/stores/auth'
  import { MessageToast } from 'vx-vue'
  import { computed, onMounted, ref } from 'vue'
  import router from '@/router'

  const authStore = useAuthStore()
  const toast = ref({})
  const layout = computed(() => router.currentRoute.value?.meta.layout || 'DefaultLayout')

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
  onMounted(async () => {
    onMounted(async () => {
      await router.isReady()
      const currentRoute = router.currentRoute.value
      if (!currentRoute.meta?.noAuth && !authStore.credentials.bearerToken) {
        await router.replace({ name: 'login' })
      }
    })

  })
</script>

<template>
  <component
    :is="layout"
    @notify="notify"
    @fetch-error="handleFetchError"
  >
    <router-view
      @notify="notify"
      @fetch-error="handleFetchError"
    />
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