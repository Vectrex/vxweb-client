<script setup>
  import router from "@/router"

  const props = defineProps({ expanded: Boolean })
  const linkedRoutes = router.options.routes.filter(route => route.meta?.label)
  const userRoles = JSON.parse(sessionStorage.getItem('currentUser'))?.roles || []
</script>

<template>
  <nav>
    <template v-for="route in linkedRoutes" :key="route.path">
      <router-link
          v-if="
            !route.meta.roles ||
            !route.meta.roles.length ||
            userRoles.filter(item => route.meta.roles.includes(item)).length
          "
          :to="route.name ? { name: route.name } : { path: route.path }"
          :class="['flex items-center px-2 py-2 text-base font-medium rounded-sm items-center space-x-2 flex-nowrap overflow-hidden',
              $route.matched[0]?.path === route.path ? 'bg-vxvue-500 text-white' : 'text-slate-100 hover:bg-vxvue-700'
          ]"
      >
        <component :is="route.meta.icon" v-if="route.meta.icon" class="shrink-0 size-8" />
        <span v-if="expanded">{{ route.meta.label }}</span>
      </router-link>
    </template>
  </nav>
</template>