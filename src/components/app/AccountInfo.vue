<script setup>
  import { Cog6ToothIcon, PowerIcon } from '@heroicons/vue/24/solid'
  import { useAuthStore } from '@/stores/auth'
  import ProfileForm from '@/components/app/ProfileForm.vue'
  import FormTitle from '@/components/views/shared/FormTitle.vue'
  import { Modal } from 'vx-vue'
  import router from '@/router'
  import { ref } from 'vue'

  const props = defineProps({ expanded: Boolean })
  const emit = defineEmits(['notify', 'fetch-error'])
  const authStore = useAuthStore()
  const showForm = ref(false)
  const logout = async () => {
        authStore.logout()
        await router.push({ name: 'login' })
  }

</script>
<template>
  <div class="space-y-2">
    <button
      class="flex overflow-hidden flex-nowrap items-center space-x-2 text-white hover:text-white/75"
      @click="showForm = !showForm"
    >
      <cog-6-tooth-icon class="shrink-0 size-8" /><span v-if="expanded" class="whitespace-nowrap">{{ authStore.credentials.user?.username }} ({{ authStore.credentials.user?.email }})</span>
    </button>
    <a
      href="/logout"
      class="flex items-center space-x-2 text-white hover:text-white/75"
      @click.prevent="logout"
    >
      <power-icon class="shrink-0 size-8" /><span v-if="expanded">Abmelden</span></a>
  </div>

  <modal :show="showForm" container-class="w-full lg:w-1/2 xl:w-1/4 max-h-[90vh]">
    <template #title>
      <form-title @cancel="showForm = false">Meine Einstellungen</form-title>
    </template>
    <template #default>
      <profile-form
        class="p-4"
        @cancel="showForm = false"
        @notify="emit('notify', $event)"
        @fetch-error="emit('fetch-error', $event)"
      />
    </template>
  </modal>
</template>
