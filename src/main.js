import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// ← import your auth store
import { useAuthStore } from '@/stores/auth'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'

const app = createApp(App)

// 1. create & register Pinia
const pinia = createPinia()
app.use(pinia)

// 2. initialize Firebase → Pinia sync
const authStore = useAuthStore()
authStore.init()

// 3. register router and wait for it before mounting
app.use(router)
router.isReady().then(() => {
  app.mount('#app')
})
