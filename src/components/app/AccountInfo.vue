<script setup>
  import { PowerIcon, Cog6ToothIcon } from '@heroicons/vue/24/solid'

  const props = defineProps({ user: Object, expanded: Boolean })
  const emit = defineEmits(['authenticate'])
</script>
<template>
  <div class="space-y-2">
    <router-link
      :to="{ name: 'profile' }"
      class="flex overflow-hidden flex-nowrap items-center space-x-2 text-white hover:text-white/75"
    >
      <cog-6-tooth-icon class="flex-shrink-0 w-8 h-8" /><span class="whitespace-nowrap" v-if="expanded">{{ user.username }} ({{ user.email }})</span>
    </router-link>
    <a href="logout" @click.prevent="emit('authenticate', null)"
       class="flex items-center space-x-2 text-white hover:text-white/75"
    >
      <power-icon class="flex-shrink-0 w-8 h-8" /><span v-if="expanded">Abmelden</span></a>
  </div>
</template>
