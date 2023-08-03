<script setup>
  import { XMarkIcon } from '@heroicons/vue/24/solid'
  import { computed, onMounted, ref, watch } from 'vue'

  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps({
    title: String,
    message: [String, Array],
    timeout: { type: Number, default: 5000 },
    active: { type: Boolean, default: false }
  })
  const emit = defineEmits(['timeout', 'close'])
  const activeTimeout = ref(null)
  const lines = computed(() => typeof props.message === 'string' ? [props.message] : props.message)
  const startTimeout = () => {
    window.clearTimeout(activeTimeout.value)

    // timeout 0 disables fadeout

    if (props.active && props.timeout) {
      activeTimeout.value = window.setTimeout(() => { emit('timeout') }, props.timeout)
    }
  }

  watch(() => props.active, startTimeout)
  onMounted(startTimeout)
</script>

<template>
  <div aria-live="assertive" class="fixed inset-0 flex px-4 py-6 pointer-events-none sm:p-6 items-start z-50">
    <div class="w-full flex flex-col items-center space-y-4">
      <transition name="messagetoast-fade">
        <div v-if="active" class="max-w-sm w-full shadow-lg rounded-md pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden" :class="$attrs['class']">
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <slot name="icon"></slot>
              </div>
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p class="font-bold">
                  <slot name="title">{{ title }}</slot>
                </p>
                <p class="mt-1" v-for="line in lines">
                  <slot>{{ line }}</slot>
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button @click="emit('close')" class="bg-black bg-opacity-20 rounded-sm inline-flex text-white hover:text-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-200">
                  <span class="sr-only">Close</span>
                  <x-mark-icon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
  .messagetoast-fade-enter-from,
  .messagetoast-fade-leave-to {
    @apply opacity-0 transform-gpu -translate-y-10;
  }
  .messagetoast-fade-enter-to,
  .messagetoast-fade-leave-from {
    @apply opacity-100 translate-y-0;
  }
  .messagetoast-fade-enter-active,
  .messagetoast-fade-leave-active {
    @apply transition-all duration-300;
  }
</style>
