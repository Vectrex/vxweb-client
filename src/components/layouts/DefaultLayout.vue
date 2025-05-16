<script setup>
  import { Bars3Icon } from "@heroicons/vue/24/solid"
  import MainMenu from "@/components/app/MainMenu.vue"
  import AccountInfo from "@/components/app/AccountInfo.vue"
  import Logo from "@/components/misc/logo.vue"
  import { ref } from "vue"

  const emit = defineEmits(['notify', 'fetch-error'])
  const sideBarExpanded = ref(false)
</script>

<template>
  <div class="flex w-full">
    <div :class="['min-h-screen flex flex-col transition-all duration-100 shrink-0', sideBarExpanded ? 'w-72' : 'w-16']">
      <div class="flex overflow-y-auto flex-col grow bg-vxvue">
        <div class="flex items-end pr-2 pb-2 pl-4 space-x-2 h-24 bg-vxvue-600">
          <button @click="sideBarExpanded = !sideBarExpanded">
            <bars3-icon class="w-8 h-8 text-white shrink-0" />
          </button>
          <logo v-if="sideBarExpanded" class="w-44 text-white" />
        </div>
        <div class="flex flex-col flex-1">
          <main-menu class="flex-1 py-6 px-2 space-y-1" :expanded="sideBarExpanded" />
        </div>
        <div class="p-4 h-32 border-t border-t-white">
          <account-info
            :expanded="sideBarExpanded"
            @notify="emit('notify', $event)"
            @fetch-error="emit('fetch-error', $event)"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-1 min-h-screen">
      <div class="flex flex-1 items-end px-8 pb-2 h-24 bg-white border-b shadow-sm border-slate-500/10">
        <div class="flex justify-start items-center w-full text-vxvue-700">
          <div id="tools" />
        </div>
      </div>

      <div class="overflow-hidden h-[calc(100vh-var(--header-height))]">
        <main class="flex overflow-y-auto flex-col flex-1 w-full h-full">
          <div class="px-8 pt-6">
            <div><slot /></div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
