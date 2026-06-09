<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">
    <!-- Nav -->
    <nav
      class="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20"
        >
          <svg
            class="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>
        <span class="font-bold text-white text-lg tracking-tight"
          >PeerReview</span
        >
      </div>
      <button
        @click="auth.loginWithGithub()"
        class="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        <GithubIcon class="w-4 h-4" />
        Sign in with GitHub
      </button>
    </nav>

    <!-- Hero -->
    <section
      class="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center"
    >
      <div
        class="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-sm font-medium mb-8"
      >
        <span
          class="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"
        ></span>
        Powered by Llama 3.3 70B
      </div>

      <h1
        class="text-5xl sm:text-6xl font-extrabold text-white leading-[1.1] mb-6 max-w-3xl"
      >
        AI code review<br />
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400"
          >for every branch.</span
        >
      </h1>

      <p class="text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
        Upload a README.md with your review checklist. We fetch the diff, pass
        it to Gemini, and stream back the review — instantly.
      </p>

      <button
        @click="auth.loginWithGithub()"
        class="inline-flex items-center gap-3 bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5"
      >
        <GithubIcon class="w-5 h-5" />
        Start reviewing — it's free
      </button>
      <p class="text-gray-600 text-sm mt-3">Free · No credit card needed</p>

      <!-- Permissions trust card -->
      <div
        class="mt-8 max-w-lg w-full bg-gray-900/60 border border-gray-800 rounded-2xl p-5 text-left"
      >
        <div class="flex items-center gap-2 mb-4">
          <svg
            class="w-4 h-4 text-emerald-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span class="text-sm font-semibold text-gray-200"
            >What GitHub access we request</span
          >
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Can do -->
          <div>
            <p
              class="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2.5"
            >
              ✓ Read only
            </p>
            <ul class="space-y-2">
              <li
                v-for="item in canDo"
                :key="item"
                class="flex items-start gap-2"
              >
                <svg
                  class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span class="text-gray-300 text-sm">{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Cannot do -->
          <div>
            <p
              class="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2.5"
            >
              ✗ Never
            </p>
            <ul class="space-y-2">
              <li
                v-for="item in cannotDo"
                :key="item"
                class="flex items-start gap-2"
              >
                <svg
                  class="w-4 h-4 text-red-500/70 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span class="text-gray-500 text-sm">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <p class="text-gray-600 text-xs mt-4 pt-4 border-t border-gray-800">
          Only your branch diff is sent for review. Your code never leaves your
          GitHub account.
        </p>
      </div>
    </section>

    <!-- Use case cards -->
    <section class="max-w-5xl mx-auto w-full px-6 pb-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="card in useCases"
          :key="card.title"
          class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
        >
          <div class="text-2xl mb-4">{{ card.icon }}</div>
          <h3 class="font-semibold text-white mb-2">{{ card.title }}</h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-4">
            {{ card.description }}
          </p>
          <div class="bg-gray-950 rounded-lg p-3 border border-gray-800">
            <p
              class="text-gray-500 text-xs font-mono leading-relaxed whitespace-pre-line"
            >
              {{ card.example }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="max-w-4xl mx-auto w-full px-6 pb-20">
      <h2 class="text-2xl font-bold text-white text-center mb-10">
        How it works
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="flex flex-col items-center text-center"
        >
          <div
            class="w-11 h-11 bg-violet-600/20 border border-violet-500/30 rounded-full flex items-center justify-center mb-4 text-violet-300 font-bold"
          >
            {{ i + 1 }}
          </div>
          <h3 class="font-semibold text-white mb-2 text-sm">
            {{ step.title }}
          </h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="border-t border-gray-800/60 py-6 text-center text-gray-600 text-sm"
    >
      Built by <span class="text-violet-400 font-medium">Shashi Lokini</span>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, defineComponent, h } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

const auth = useAuthStore();
const router = useRouter();

onMounted(async () => {
  await auth.fetchMe();
  if (auth.user) router.replace("/review");
});

const GithubIcon = defineComponent({
  render: () =>
    h("svg", { fill: "currentColor", viewBox: "0 0 24 24" }, [
      h("path", {
        d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
      }),
    ]),
});

const useCases = [
  {
    icon: "🔍",
    title: "Code Quality Review",
    description:
      "Catch duplicate logic, missing error handling, magic strings, and naming issues — with line-level fixes before they hit main.",
    example:
      "🔴 Critical — bug, regression, memory leak\n🟡 Warning — convention violation\n🔵 Suggestion — non-blocking\n\nVerdict: APPROVE / REQUEST CHANGES",
  },
  {
    icon: "🛡️",
    title: "Security Audit",
    description:
      "Scan diffs for hardcoded secrets, XSS, broken auth, and insecure patterns — rated by exploitability.",
    example:
      "🔴 Exposed API key at auth.js:L42\n🔴 Missing rel=\"noopener\" on\n   external link\n🟡 PII logged in error handler",
  },
  {
    icon: "🏗️",
    title: "Architecture Review",
    description:
      "Catch coupling violations, broken contracts, over-engineering, and state management issues before they compound.",
    example:
      "🔴 UI layer importing from infra\n🟡 Component doing 3 unrelated\n   things — low cohesion\n🔵 Consider extracting composable",
  },
];

const canDo = [
  "Read your repos list",
  "Read branch names",
  "Read code diffs (to send for review)",
];

const cannotDo = [
  "Write, push, or modify code",
  "Create/close issues or PRs",
  "Access Actions or secrets",
  "Delete anything",
];

const steps = [
  {
    title: "Connect GitHub",
    desc: "One click. Your repos and branches load automatically — no tokens, no config, nothing to set up.",
  },
  {
    title: "Set your review rules",
    desc: "Tell the AI exactly what to look for — duplicate code, poor composition, or changes that break existing functionality. Write it once as a README.md and reuse it on every branch.",
  },
  {
    title: "Watch the review stream in",
    desc: "Hit Start. We pull the diff, run it through Gemini, and stream the feedback back to you live — like a senior dev reviewing in real time.",
  },
];
</script>
