<script setup>
  import PasswordInput from "@/components/vx-vue/password-input.vue"

  const props = defineProps({ hash: String })
</script>

<template>
  <div>
    <password-input />
    <password-input />
    {{ hash }}
  </div>
</template>
