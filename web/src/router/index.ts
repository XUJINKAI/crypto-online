import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/ecdh'
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
      path: '/:pathMatch(.*)',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

export default router
