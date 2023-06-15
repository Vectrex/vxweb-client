<script setup>
  import SimpleTreeBranch from "@/components/vx-vue/simple-tree/simple-tree-branch.vue"

  const props = defineProps({ branch: Object })
  const emit = defineEmits(['branch-selected'])
</script>
<template>
  <ul class="flex">
    <simple-tree-branch :branch="branch" @branch-selected="emit('branch-selected', $event)" v-bind="$attrs" />
  </ul>
</template>