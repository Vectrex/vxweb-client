<script setup>
  import { PasswordInput, SubmitButton, VFloatingLabel, VFocus } from "vx-vue"
  import { vxFetch } from "@/composables/vxFetch"
  import { ref } from "vue"

  const emit = defineEmits(['notify'])
  const success = ref(false)
  const props = defineProps({ hash: { type: String, default: '' }})
  const form = ref({ password: '', passwordRepeat: '' })
  const submit = async () => {
    if(form.value.password.length >= 8 && form.value.password === form.value.passwordRepeat) {
      const response = (await vxFetch()('set-password/' + props.hash).put(JSON.stringify(form.value)).json()).data.value
      if (response.success) {
        success.value = true
      }
      else {
        emit('notify', response)
      }
    }
  }
</script>

<template>
  <div class="flex flex-col justify-center py-12 min-h-screen sm:px-6 lg:px-8 bg-slate-200">
    <div class="flex flex-col p-8 space-y-4 bg-white ring-1 shadow-sm sm:mx-auto sm:w-full sm:max-w-md ring-black/5">
      <template v-if="success">
        <div class="font-bold text-center text-success">
          Das Passwort wurde erfolgreich neu gesetzt.
        </div>
        <div class="text-center">
          <router-link :to="{ name: 'login' }" class="link">
            Zum Login...
          </router-link>
        </div>
      </template>
      <template v-else>
        <password-input v-model.trim="form.password" v-floating-label v-focus placeholder="Neues Passwort (8 Zeichen oder mehr)" class="w-full" />
        <password-input v-model.trim="form.passwordRepeat" v-floating-label class="w-full" placeholder="Neues Passwort wiederholen" />
        <div class="flex justify-center">
          <submit-button theme="success" class="button" @click="submit">
            Neues Passwort bestätigen
          </submit-button>
        </div>
      </template>
    </div>
  </div>
</template>
