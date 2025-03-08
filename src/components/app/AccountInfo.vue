<script setup>
  import { Cog6ToothIcon, PowerIcon } from '@heroicons/vue/24/solid'

  const props = defineProps({ user: { type: Object, default: () => ({}) }, expanded: Boolean })
  const emit = defineEmits(['authenticate'])
</script>
<template>
  <div class="space-y-2">
    <router-link
      :to="{ name: 'profile' }"
      class="flex overflow-hidden flex-nowrap items-center space-x-2 text-white hover:text-white/75"
    >
      <cog-6-tooth-icon class="shrink-0 size-8" /><span v-if="expanded" class="whitespace-nowrap">{{ user.username }} ({{ user.email }})</span>
    </router-link>
    <a
      href="/logout"
      class="flex items-center space-x-2 text-white hover:text-white/75"
      @click.prevent="emit('authenticate', null)"
    >
      <power-icon class="shrink-0 size-8" /><span v-if="expanded">Abmelden</span></a>
  </div>
</template>
