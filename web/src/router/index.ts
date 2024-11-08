import { nextTick } from 'vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/msg',
    name: 'msg',
    component: () => import('../views/MsgView.vue'),
    meta: { title: 'Msg' }
  },
  {
    path: '/base64',
    name: 'base64',
    component: () => import('../views/Base64View.vue'),
    meta: { title: 'Base64' }
  },
  {
    path: '/qrcode',
    name: 'qrcode',
    component: () => import('../views/QRCodeView.vue'),
    meta: { title: 'QR Code' }
  },
  {
    path: '/hash',
    name: 'hash',
    component: () => import('../views/HashView.vue'),
    meta: { title: 'Hash' }
  },
  {
    path: '/ecdh',
    name: 'ecdh',
    component: () => import('../views/EcdhView.vue'),
    meta: { title: 'ECDH' }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'About' }
  },
  // 404
  {
    path: '/:pathMatch(.*)',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

function EnsureGA4(ga4id: string) {
  /* 
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-4Q0MVTQ7HL"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-4Q0MVTQ7HL');
    </script>
  */
  if (document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${ga4id}"]`)) {
    // console.log('GA4 already loaded');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4id}`;
  document.head.appendChild(script);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', '${ga4id}');
  `;
  document.head.appendChild(script2);
}

const DEFAULT_TITLE = 'Crypto Online';
router.afterEach((to, from) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  nextTick(() => {
    document.title = to.meta.title ? `${to.meta.title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    EnsureGA4('G-4Q0MVTQ7HL');
  });
});

export default router
