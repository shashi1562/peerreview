<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">
    <NavBar />

    <main class="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-white">Review History</h1>
          <p class="text-gray-500 text-sm mt-1">All your past reviews, saved automatically.</p>
        </div>
        <RouterLink
          to="/review"
          class="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Review
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="reviews.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="text-4xl mb-4">📭</div>
        <h2 class="text-gray-400 font-medium mb-2">No reviews yet</h2>
        <p class="text-gray-600 text-sm mb-6">Run your first review and it'll appear here.</p>
        <RouterLink to="/review" class="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
          Start a review →
        </RouterLink>
      </div>

      <!-- Review list -->
      <div v-else class="space-y-3">
        <div
          v-for="r in reviews"
          :key="r.id"
          class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
        >
          <!-- Card header -->
          <button
            class="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
            @click="toggle(r.id)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-white truncate">{{ r.repoName }}</span>
                <span class="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  {{ r.branchName }}
                </span>
              </div>
              <p class="text-gray-500 text-xs mt-1.5 line-clamp-2">{{ excerpt(r.reviewOutput) }}</p>
              <p class="text-gray-700 text-xs mt-1.5">{{ formatDate(r.createdAt) }}</p>
            </div>
            <svg
              class="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5 transition-transform"
              :class="{ 'rotate-180': expanded === r.id }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Expanded content -->
          <div v-if="expanded === r.id" class="border-t border-gray-800 px-5 py-5">
            <div class="prose-review" v-html="render(r.reviewOutput)"></div>
            <div class="mt-4 flex items-center gap-3">
              <RouterLink
                to="/review"
                class="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Re-run this review →
              </RouterLink>
              <button
                @click="copyText(r.reviewOutput)"
                class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Copy output
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { marked } from 'marked'
import NavBar from '../components/NavBar.vue'

const reviews = ref([])
const loading = ref(true)
const expanded = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/api/reviews', { credentials: 'include' })
    reviews.value = res.ok ? await res.json() : []
  } finally {
    loading.value = false
  }
})

function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}

function excerpt(text) {
  const plain = text.replace(/[#*`>_\[\]]/g, '').trim()
  return plain.length > 200 ? plain.slice(0, 200) + '…' : plain
}

function render(text) {
  return marked.parse(text)
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function copyText(text) {
  await navigator.clipboard.writeText(text)
}
</script>
