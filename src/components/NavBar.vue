<template>
  <nav class="border-b border-gray-800/60 px-5 py-3 flex items-center justify-between sticky top-0 bg-gray-950/90 backdrop-blur z-20">
    <!-- Logo -->
    <div class="flex items-center gap-2.5">
      <div class="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
        <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <span class="font-bold text-white text-base tracking-tight">PeerReview</span>
    </div>

    <!-- Nav links + user -->
    <div class="flex items-center gap-1">
      <RouterLink
        to="/review"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === '/review' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-900'"
      >
        Review
      </RouterLink>
      <RouterLink
        to="/dashboard"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === '/dashboard' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-900'"
      >
        Dashboard
      </RouterLink>

      <!-- User menu -->
      <div v-if="auth.user" class="relative ml-2" ref="menuRef">
        <button
          @click="menuOpen = !menuOpen"
          class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors"
        >
          <img :src="auth.user.avatarUrl" :alt="auth.user.username" class="w-6 h-6 rounded-full" />
          <span class="text-gray-300 text-sm hidden sm:block">{{ auth.user.username }}</span>
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-1 w-44 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-30"
        >
          <div class="px-4 py-2.5 border-b border-gray-800">
            <p class="text-xs text-gray-500">Signed in as</p>
            <p class="text-sm text-white font-medium truncate">{{ auth.user.username }}</p>
          </div>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref(null)

async function handleLogout() {
  await auth.logout()
  router.push('/')
}

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
