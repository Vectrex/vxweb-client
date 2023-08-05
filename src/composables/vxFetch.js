import { createFetch } from "@vueuse/core";
import router from "@/router";

export const vxFetch = createFetch({
    baseUrl: import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/'),
    options: {
        beforeFetch ({ options }) {
            const bearerToken = sessionStorage.getItem("bearerToken");
            if (bearerToken) {
                options.headers.Authorization = `Bearer ${bearerToken}`;
            }
            return options;
        },
        afterFetch (ctx) {
            if(ctx.response.headers.get('bearerToken')) {
                sessionStorage.setItem('bearerToken', ctx.response.headers.get('bearerToken'));
            }
            return ctx;
        },
        onFetchError (ctx) {
            router.replace({ name: 'authFailed' });
            ctx.data = {};
            return ctx;
        }
    },
    fetchOptions: {
        mode: 'cors'
    }
})
