import './index.css'
import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { plugin as SlickSort } from 'vue-slicksort'

const app = createApp(App)
app
    .use(router)
    .use(SlickSort)
    .provide('api', import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/'))
    .mount('#app')
