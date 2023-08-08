<script setup>
  import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
  import { useAttrs, computed, ref } from 'vue'

  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])
  const show = ref(false)

  const inputAttrs = computed(() => {
    let attrs = Object.assign({}, useAttrs())
    delete attrs['class']
    return attrs
  })
</script>
<template>
  <div class="inline-block relative" :class="$attrs['class']">
    <input
        :value="modelValue"
        :type="show ? 'text': 'password'"
        @input="emit('update:modelValue', $event.target.value)"
        v-bind="inputAttrs"
        class="block pr-10 w-full form-input focus:border-brand"
    >
    <button @click.stop="show = !show" class="flex absolute inset-y-0 right-0 items-center pr-3 text-brand-700 hover:text-brand">
      <eye-slash-icon class="w-5 h-5" v-if="show" />
      <eye-icon class="w-5 h-5" v-else />
    </button>
  </div>
</template>