// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'login' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Wait for the auth store to initialize
  if (!auth.ready) {
    const unwatch = auth.$subscribe((_, state) => {
      if (state.ready) {
        unwatch()
        checkAuth()
      }
    })
  } else {
    checkAuth()
  }

  function checkAuth() {
    if (to.meta.requiresAuth && !auth.user) {
      // not signed in, redirect to login
      next({ name: 'login' })
    } else if (to.name === 'login' && auth.user) {
      // already signed in, redirect to home
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

export default router
