import './index.css';
import 'vx-vue/vx-vue.css';
import { createApp } from 'vue';
import router from './router';
import App from './App.vue';
import { plugin as SlickSort } from 'vue-slicksort';

const layouts = import.meta.glob('./components/layouts/*.vue', { eager: true });
const app = createApp(App);
Object.entries(layouts).forEach(([path, component]) => app.component(path.split('/').pop().replace(/\.\w+$/, ''), component.default));

app
    .use(router)
    .use(SlickSort)
    .provide('api', import.meta.env.VITE_API_ROOT || ('//' + window.location.host + '/admin/'))
    .mount('#app')
;
