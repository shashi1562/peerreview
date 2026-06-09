import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import LandingPage from './pages/LandingPage.vue'
import ReviewPage from './pages/ReviewPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import AuthCallback from './pages/AuthCallback.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/review', component: ReviewPage, meta: { requiresAuth: true } },
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/auth/callback', component: AuthCallback },
  ],
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

import { useAuthStore } from './stores/auth.js'

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.user && !auth.loading) {
      await auth.fetchMe()
    }
    if (!auth.user) return '/'
  }
})

app.mount('#app')
