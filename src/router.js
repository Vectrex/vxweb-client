import { createRouter, createWebHistory } from 'vue-router'
import { UsersIcon, NewspaperIcon, DocumentIcon, PhotoIcon } from '@heroicons/vue/24/solid'

function lazyLoad (view) {
    return () => import (`@/components/views/${view}.vue`)
}

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'login',
            path: '/',
            component: lazyLoad('Login')
        },
        {
            name: 'profile',
            path: '/profile',
            component: lazyLoad('Profile'),
            meta: {
                heading: 'Meine Einstellungen'
            }
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
            name: 'articles',
            path: '/articles',
            component: lazyLoad('Articles'),
            meta: {
                label: 'Artikel',
                icon: NewspaperIcon
            }
        },
        {
            name: 'articleEdit',
            path: '/article/:id?/:section?/:sectionId?',
            component: lazyLoad('ArticleEdit'),
            props: true
        },
        {
            name: 'pages',
            path: '/pages',
            component: lazyLoad('Pages'),
            meta: {
                label: 'Seiten',
                icon: DocumentIcon,
                heading: 'Seiten',
                roles: ['superadmin']
            }
        },
        {
            name: 'pageEdit',
            path: '/page/:id?',
            component: lazyLoad('PageEdit'),
            props: true
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
            name: 'authFailed',
            component: lazyLoad('AuthFailed')
        }
    ]
});

router.beforeEach (async (to, from) => {
});

export default router;
