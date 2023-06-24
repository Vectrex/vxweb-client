<script setup>
  import { computed, useAttrs } from "vue"

  const props = defineProps(['modelValue'])
  const emit = defineEmits(['update:modelValue'])

  const outerClass = computed (() => props.modelValue ? "bg-vxvue" : "bg-slate-200")
  const innerClass = computed (() => props.modelValue ? "translate-x-5" : "translate-x-0")
  const inputAttrs = computed(() => {
    let attrs = Object.assign({}, useAttrs())
    delete attrs['class']
    return attrs
  })
</script>

<template>
  <label :class="$attrs['class']">
    <span
        :class="outerClass"
        class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vxvue"
        role="switch"
        :aria-checked="!!modelValue"
    >
      <span
          aria-hidden="true"
          :class="innerClass"
          class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      ></span>
      <input class="hidden" value="1" type="checkbox" @change="emit('update:modelValue', $event.target.checked)" v-bind="inputAttrs" :checked="modelValue" />
    </span>
  </label>
  <slot></slot>
</template>
