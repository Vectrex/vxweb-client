import { defineStore } from 'pinia'
import { useSessionStorage } from '@vueuse/core'
export const useAuthStore = defineStore('auth', () => {
    const credentials = useSessionStorage('auth', {})
    const logout = () => credentials.value = {}
    const authenticate = cred => credentials.value = (cred && cred.bearerToken) ? cred : {}
    return { credentials, logout, authenticate }
})