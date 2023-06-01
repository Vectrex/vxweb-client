<script setup>
  import { computed } from "vue";

  const props = defineProps({
    progress: Number,
    radius: { type: Number, default: 24 },
    strokeWidth: { type: Number, default: 8 },
  })
  const size = computed(() => props.radius * 2)
  const normalizedRadius = computed(() => props.radius - props.strokeWidth / 2)
  const circumference  = computed(() => normalizedRadius * 2 * Math.PI)
  const strokeDashoffset = computed(() => circumference - props.progress / 100 * circumference)
</script>

<template>
  <svg :height="size" :width="size" class="circular-progress">
    <circle
        stroke="white"
        fill="transparent"
        :stroke-width="strokeWidth"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
    />
    <circle
        stroke="currentColor"
        fill="transparent"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset }"
        :stroke-width="strokeWidth"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
    />
  </svg>
</template>