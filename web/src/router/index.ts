import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/ecdh',
      name: 'ecdh',
      component: () => import('../views/EcdhView.vue')
    },
    {
      path: '/hash',
      name: 'hash',
      component: () => import('../views/HashView.vue')
    },
    {
      path: '/base64',
      name: 'base64',
      component: () => import('../views/Base64View.vue')
    },
    {
      path: '/qrcode',
      name: 'qrcode',
      component: () => import('../views/QRCodeView.vue')
    },
    {
      path: '/:pathMatch(.*)',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

export default router
