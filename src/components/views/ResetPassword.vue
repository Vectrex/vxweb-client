<script setup>
  import { PasswordInput } from "vx-vue"

  const props = defineProps({ hash: String })
</script>

<template>
  <div>
    <password-input />
    <password-input />
    {{ hash }}
  </div>
</template>
