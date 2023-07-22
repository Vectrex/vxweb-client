<script setup>
  const props = defineProps({ show: Boolean })
</script>

<template>
  <div class="fixed inset-0 bg-white/50 z-20 backdrop-blur-sm" aria-hidden="true" v-if="props.show" />
  <transition name="appear">
    <div class="fixed inset-0 z-30 my-8" v-if="props.show">
      <div class="flex items-end justify-center items-center">
        <div class="relative transform overflow-hidden rounded bg-white shadow-xl ring-1 ring-black ring-opacity-10 transition-all w-3/4 max-w-full xl:max-w-screen-xl">
          <slot name="title" />
          <div class="h-[calc(100vh-4rem)] py-4">
            <div class="h-full overflow-y-auto"><slot /></div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
