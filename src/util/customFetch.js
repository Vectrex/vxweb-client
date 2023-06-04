import { createFetch } from "@vueuse/core";
import {inject} from "vue";
export const customFetch = createFetch({
    baseUrl: import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/'),
    options: {
        beforeFetch ( { options }) {
            const bearerToken = sessionStorage.getItem("bearerToken");
            if (bearerToken) {
                options.headers.Authorization = `Bearer ${bearerToken}`;
            }
            return options;
        },
        afterFetch (context) {
            if(context.response.headers.get('bearerToken')) {
                sessionStorage.setItem('bearerToken', context.response.headers.get('bearerToken'));
            }
            return context;
        }
    },
    fetchOptions: {
        mode: 'cors'
    }
})
