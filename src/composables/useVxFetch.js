import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/util/HttpError'

export const vxFetch = createFetch({
  baseUrl: import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/'),
  options: {
    beforeFetch ({ options }) {
      const bearerToken = useAuthStore().credentials.bearerToken;
      if (bearerToken) {
        options.headers.Authorization = `Bearer ${bearerToken}`;
      }
      return options;
    },
    afterFetch (ctx) {
      if(ctx.response.headers.get('bearerToken')) {
        useAuthStore().credentials.bearerToken = ctx.response.headers.get('bearerToken');
      }
      return ctx;
    },
    onFetchError (ctx) {
      ctx.error = new HttpError(ctx.response)
      return ctx;
    }
  },
  fetchOptions: {
    mode: 'cors',
    updateDataOnError: false
  }
})
