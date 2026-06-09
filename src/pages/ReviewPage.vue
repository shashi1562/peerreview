<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">
    <NavBar />

    <main class="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
      <!-- Left panel: controls -->
      <aside class="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-gray-800 p-5 flex flex-col gap-5 lg:overflow-y-auto lg:h-[calc(100vh-57px)]">
        <div>
          <h1 class="text-lg font-semibold text-white mb-1">New Review</h1>
          <p class="text-gray-500 text-sm">Select a repo, enter a branch, upload your review instructions.</p>
        </div>

        <!-- Repo selector -->
        <div>
          <label class="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Repository</label>
          <div class="relative">
            <select
              v-model="selectedRepo"
              @change="onRepoChange"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-violet-500 transition-colors"
              :disabled="loadingRepos"
            >
              <option value="" disabled>{{ loadingRepos ? 'Loading repos…' : 'Select a repository' }}</option>
              <option v-for="r in repos" :key="r.full_name" :value="r.full_name">
                {{ r.full_name }}{{ r.private ? ' 🔒' : '' }}
              </option>
            </select>
            <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Branch input with autocomplete -->
        <div>
          <label class="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Branch</label>
          <div class="relative">
            <input
              v-model="branch"
              @input="filterBranches"
              @focus="showBranchList = filteredBranches.length > 0"
              @blur="hideBranchListDelayed"
              type="text"
              placeholder="feature/my-branch"
              class="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600"
            />
            <!-- Branch suggestions -->
            <div
              v-if="showBranchList && filteredBranches.length"
              class="absolute z-10 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto"
            >
              <button
                v-for="b in filteredBranches"
                :key="b"
                @mousedown.prevent="selectBranch(b)"
                class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-mono"
              >
                {{ b }}
              </button>
            </div>
          </div>
          <p v-if="loadingBranches" class="text-xs text-gray-600 mt-1">Loading branches…</p>
        </div>

        <!-- README uploader -->
        <ReadmeUploader v-model="readmeContent" />

        <!-- Template picker -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick templates</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in templates"
              :key="t.label"
              @click="readmeContent = t.content"
              class="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors border border-gray-700"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          @click="runReview"
          :disabled="!canSubmit || review.streaming"
          class="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm mt-auto"
        >
          <span v-if="review.streaming">
            <span class="spinner"></span>
          </span>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ review.streaming ? 'Reviewing…' : 'Start Review' }}
        </button>
      </aside>

      <!-- Right panel: review output -->
      <section class="flex-1 flex flex-col p-5 lg:p-8 lg:overflow-y-auto lg:h-[calc(100vh-57px)]">
        <!-- Empty state -->
        <div v-if="!review.reviewText && !review.streaming && !review.error" class="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div class="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4 text-2xl">⚡</div>
          <h2 class="text-gray-400 font-medium mb-2">Ready to review</h2>
          <p class="text-gray-600 text-sm max-w-xs">Select a repo and branch, upload review instructions, then hit Start Review.</p>
        </div>

        <!-- Error -->
        <div v-if="review.error" class="bg-red-950/50 border border-red-800/60 rounded-xl p-4 mb-6">
          <p class="text-red-400 text-sm font-medium">⚠ {{ review.error }}</p>
        </div>

        <!-- Streaming / done output -->
        <div v-if="review.reviewText || review.streaming">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="font-semibold text-white text-sm">
                {{ currentRepo || 'Review' }}
                <span v-if="currentBranch" class="text-violet-400 font-mono ml-1">→ {{ currentBranch }}</span>
              </h2>
              <p class="text-gray-600 text-xs mt-0.5">{{ review.done ? 'Review complete — saved to dashboard' : 'Streaming…' }}</p>
            </div>
            <button
              v-if="review.done"
              @click="copyReview"
              class="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>

          <!-- Rendered markdown -->
          <div
            class="prose-review"
            :class="{ 'cursor-blink': review.streaming }"
            v-html="renderedReview"
          ></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import NavBar from '../components/NavBar.vue'
import ReadmeUploader from '../components/ReadmeUploader.vue'
import { useReviewStore } from '../stores/review.js'

const review = useReviewStore()

const repos = ref([])
const loadingRepos = ref(false)
const selectedRepo = ref('')

const branches = ref([])
const filteredBranches = ref([])
const loadingBranches = ref(false)
const branch = ref('')
const showBranchList = ref(false)

const readmeContent = ref('')
const currentRepo = ref('')
const currentBranch = ref('')
const copied = ref(false)

const canSubmit = computed(() =>
  selectedRepo.value && branch.value.trim() && readmeContent.value.trim()
)

const renderedReview = computed(() => {
  if (!review.reviewText) return ''
  return marked.parse(review.reviewText)
})

onMounted(async () => {
  loadingRepos.value = true
  try {
    const res = await fetch('/api/github/repos', { credentials: 'include' })
    repos.value = res.ok ? await res.json() : []
  } finally {
    loadingRepos.value = false
  }
})

async function onRepoChange() {
  branch.value = ''
  branches.value = []
  filteredBranches.value = []
  if (!selectedRepo.value) return

  const [owner, repo] = selectedRepo.value.split('/')
  loadingBranches.value = true
  try {
    const res = await fetch(`/api/github/branches?owner=${owner}&repo=${repo}`, { credentials: 'include' })
    branches.value = res.ok ? await res.json() : []
    filteredBranches.value = branches.value
  } finally {
    loadingBranches.value = false
  }
}

function filterBranches() {
  const q = branch.value.toLowerCase()
  filteredBranches.value = q
    ? branches.value.filter(b => b.toLowerCase().includes(q))
    : branches.value
  showBranchList.value = filteredBranches.value.length > 0
}

function selectBranch(b) {
  branch.value = b
  showBranchList.value = false
}

function hideBranchListDelayed() {
  setTimeout(() => { showBranchList.value = false }, 150)
}

async function runReview() {
  if (!canSubmit.value) return
  const [owner, repo] = selectedRepo.value.split('/')
  currentRepo.value = selectedRepo.value
  currentBranch.value = branch.value.trim()
  await review.startReview({
    owner,
    repo,
    branch: branch.value.trim(),
    readmeContent: readmeContent.value,
  })
}

async function copyReview() {
  await navigator.clipboard.writeText(review.reviewText)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const templates = [
  {
    label: '🔍 Code Quality',
    content: `You are a senior software engineer. Review this git diff for defects, regressions, and violations that a 10-year engineer would stop a merge for.

## What to check
- Code smells and anti-patterns
- Naming conventions and clarity
- Unnecessary complexity or over-engineering
- Missing or inadequate error handling
- Functions doing too much (single responsibility)
- Duplicate or redundant code
- Magic strings/numbers — should use named constants
- Untracked TODOs or leftover console.log statements
- Missing edge case handling

## Severity
🔴 Critical — bug, data loss, regression, memory leak. Blocks merge.
🟡 Warning — convention violation, must fix before merge.
🔵 Suggestion — readability, refactor opportunity, non-blocking.

## Output format

### Summary
One paragraph: what the diff does, overall quality, headline impression.

### Critical Issues 🔴
- **File**: path/to/file:L42
- **Problem**: what's wrong and why it matters
- **Fix**: corrected code snippet

### Warnings 🟡
Same format as Critical.

### Suggestions 🔵
Same format.

### Verdict
APPROVE / REQUEST CHANGES / NEEDS DISCUSSION — one sentence.

Scope: only flag lines added or modified in this diff. Skip praise. Cite file and line. Show the correct pattern in code.`,
  },
  {
    label: '🛡️ Security',
    content: `You are a senior security engineer. Scan this diff for vulnerabilities that a security-focused reviewer would block a merge for.

## What to check
- Hardcoded secrets, API keys, passwords, or tokens
- XSS vulnerabilities (v-html, innerHTML, dangerouslySetInnerHTML)
- SQL/NoSQL injection risks
- Insecure external links (target="_blank" without rel="noopener noreferrer")
- Auth and permission gaps — missing guards, exposed routes
- Unsafe input handling or missing sanitisation
- PII exposure in logs, errors, or API responses
- Insecure dependencies or unsafe package imports
- CSRF, CORS, or session misconfigurations
- Sensitive data stored in localStorage or cookies without httpOnly

## Severity
🔴 Critical — exploitable vulnerability, exposed secret, broken auth. Blocks merge.
🟡 Warning — security debt, weak pattern, must fix before merge.
🔵 Suggestion — hardening opportunity, non-blocking.

## Output format

### Summary
What the diff changes and overall security risk level.

### Critical Issues 🔴
- **File**: path/to/file:L42
- **Problem**: what's exploitable and the attack vector
- **Fix**: corrected code snippet

### Warnings 🟡
Same format as Critical.

### Suggestions 🔵
Same format.

### Verdict
APPROVE / REQUEST CHANGES / NEEDS DISCUSSION — one sentence.

Scope: only flag lines added or modified in this diff. Cite file and line. Be specific about the attack vector.`,
  },
  {
    label: '🏗️ Architecture',
    content: `You are a software architect. Review this diff for design issues that will hurt the codebase at scale.

## What to check
- Separation of concerns violations
- Inappropriate coupling between modules or layers
- Low cohesion — components or functions doing unrelated things
- Missing or misplaced abstractions
- Over-engineering — unnecessary patterns for simple problems
- Breaking changes to existing APIs or contracts
- Scalability and performance design issues
- Dependency direction violations (UI importing from infra, etc.)
- Composition vs inheritance misuse
- State management — is local/global state used appropriately?

## Severity
🔴 Critical — architectural regression, broken contract, will cause production issues. Blocks merge.
🟡 Warning — design violation, significant tech debt introduced, must fix before merge.
🔵 Suggestion — better pattern available, non-blocking.

## Output format

### Summary
What the diff changes architecturally and overall design health.

### Critical Issues 🔴
- **File**: path/to/file:L42
- **Problem**: what's wrong and the long-term consequence
- **Fix**: concrete alternative approach or code snippet

### Warnings 🟡
Same format as Critical.

### Suggestions 🔵
Same format.

### Verdict
APPROVE / REQUEST CHANGES / NEEDS DISCUSSION — one sentence.

Scope: only flag lines added or modified in this diff. Keep feedback high-level and strategic. Show correct patterns in code.`,
  },
]
</script>
