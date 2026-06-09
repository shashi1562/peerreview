<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center">
    <div class="text-center">
      <div class="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-400">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const message = ref('Signing you in…')
const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  await auth.fetchMe()
  if (auth.user) {
    message.value = `Welcome, ${auth.user.username}!`
    setTimeout(() => router.replace('/review'), 600)
  } else {
    message.value = 'Authentication failed. Redirecting…'
    setTimeout(() => router.replace('/'), 1500)
  }
})
</script>
