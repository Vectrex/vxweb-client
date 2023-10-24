<script setup>
  import { PasswordInput } from "vx-vue"
  import SubmitButton from "@/components/misc/submit-button.vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const props = defineProps({ hash: String })
  const form = ref({ password: '', passwordRepeat: '' })
  const submit = async () => {
    if(form.value.password.length >= 8 && form.value.password === form.value.passwordRepeat) {
      const response = await ((vxFetch())().post(JSON.stringify(form.value)).json()).data.value
      console.log(response)
    }
  }
</script>

<template>
  <div class="flex flex-col justify-center py-12 min-h-screen sm:px-6 lg:px-8 bg-slate-200">
    <div class="p-8 ring-1 ring-black ring-opacity-5 shadow sm:mx-auto sm:w-full sm:max-w-md bg-white flex flex-col space-y-4">
      <div class="relative">
        <password-input id="new-password" placeholder=" " class="w-full peer" v-model.trim="form.password" />
        <label class="floating-label" for="new-password">Neues Passwort (8 Zeichen oder mehr)</label>
      </div>
      <div class="relative">
        <password-input id="new-password-repeat" placeholder=" " class="w-full peer" v-model.trim="form.passwordRepeat" />
        <label class="floating-label" for="new-password-repeat">Neues Passwort wiederholen</label>
      </div>
      <div class="flex justify-center">
        <submit-button @click="submit">Neues Passwort bestätigen</submit-button>
      </div>
    </div>
  </div>
</template>
