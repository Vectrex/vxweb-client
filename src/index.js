import './index.css'
import { createApp } from 'vue'
import router from './router'
import fetch from '@/plugins/fetch'
import App from './App.vue'
import { plugin as SlickSort } from 'vue-slicksort'

const host = import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/');

const app = createApp(App);
app
    .use(router)
    .use(fetch, { router: router, authFailureRoute: { name: 'authFailed' } })
    .use(SlickSort)
    .provide('api', host)
    .mount('#app')
;
