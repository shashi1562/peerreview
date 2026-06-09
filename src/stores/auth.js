import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  async function fetchMe() {
    loading.value = true
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      user.value = res.ok ? await res.json() : null
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    user.value = null
  }

  function loginWithGithub() {
    window.location.href = '/api/auth/github'
  }

  return { user, loading, fetchMe, logout, loginWithGithub }
})
