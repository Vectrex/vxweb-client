import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'

export const vxFetch = (emit = null) => createFetch({
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
            if (emit) {
                emit('fetch-error', ctx.response);
            }
            return ctx;
        }
    },
    fetchOptions: {
        mode: 'cors'
    }
})
