import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import xxWrap from '@/crypto/xxWrap'

const app = createApp(App)

app.use(router)

app.mount('#app');

// 注入控制台
(window as any).xx = xxWrap;
