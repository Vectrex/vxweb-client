<script setup>
  const props = defineProps({ show: Boolean })
</script>

<template>
  <div class="fixed inset-0 z-20 bg-white/50 backdrop-blur-sm" aria-hidden="true" v-if="props.show" />
  <transition name="appear">
    <div class="fixed inset-0 z-30 my-8" v-if="props.show">
      <div class="flex justify-center items-end items-center">
        <div class="overflow-hidden relative w-3/4 max-w-full bg-white rounded ring-1 ring-black ring-opacity-10 shadow-xl transition-all transform xl:max-w-screen-xl">
          <slot name="title" />
          <div class="h-[calc(100vh-4rem)] py-4">
            <div class="overflow-y-auto h-full"><slot /></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
