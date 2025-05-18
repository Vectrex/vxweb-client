import { createRouter, createWebHistory } from 'vue-router'
import { UsersIcon, NewspaperIcon, DocumentIcon, PhotoIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '@/stores/auth'

function lazyLoad (view) {
    return () => import (`@/components/views/${view}.vue`)
}

const routes = [
    {
        name: 'login',
        path: '/',
        component: lazyLoad('Login'),
        meta: {
            noAuth: true,
            layout: 'BareLayout',
        }
    },
    {
        name: 'reset-password',
        path: '/reset-password/:hash',
        component: lazyLoad('ResetPassword'),
        props: true,
        meta: {
            noAuth: true
        }
    },
    {
        path: '/articles',
        meta: {
            label: 'Artikel',
            icon: NewspaperIcon,
        },
        children: [
            {
                path: '',
                name: 'articles',
                component: lazyLoad('Articles'),
            },
            {
                name: 'articleEdit',
                path: 'edit/:id?/:section?/:sectionId?',
                component: lazyLoad('ArticleEdit'),
                props: true
            }
        ]
    },
    {
        name: 'files',
        path: '/files/:folderId?',
        component: lazyLoad('Files'),
        props: true,
        meta: {
            label: 'Dateien',
            icon: PhotoIcon
        }
    },
    {
        path: '/pages',
        meta: {
            label: 'Seiten',
            icon: DocumentIcon,
            heading: 'Seiten',
            roles: ['superadmin']
        },
        children: [
            {
                path: '',
                name: 'pages',
                component: lazyLoad('Pages'),
            },
            {
                name: 'pageEdit',
                path: 'edit/:id?',
                component: lazyLoad('PageEdit'),
                props: true
            },
        ]
    },
    {
        name: 'users',
        path: '/users',
        component:  lazyLoad('Users'),
        meta: {
            label: 'Benutzer',
            icon: UsersIcon,
            roles: ['superadmin']
        }
    },
    {
        path: '/:pathMatch(.*)',
        component: lazyLoad('404'),
        meta: {
            layout: 'BareLayout'
        }
    }
]

const pathPrefix = import.meta.env.VITE_PATH_PREFIX || '';
routes.forEach(route => route.path = pathPrefix + route.path)

const router = createRouter({
    mode: 'history',
    history: createWebHistory(),
    routes: routes
});

router.beforeEach(async (to, from) => {
    if (!to.meta.noAuth && !useAuthStore().credentials.bearerToken) {
        return { name: 'login' };
    }
    document.title = (import.meta.env.VITE_SITE_LABEL || 'vxWeb Admin') + (to.meta.label ? ' - ' + to.meta.label : '');
})
export default router;
