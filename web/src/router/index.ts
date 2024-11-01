import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/crypto'),
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
      path: '/:pathMatch(.*)',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

export default router
