import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReviewStore = defineStore('review', () => {
  const streaming = ref(false)
  const done = ref(false)
  const reviewText = ref('')
  const error = ref(null)

  async function startReview({ owner, repo, branch, readmeContent }) {
    streaming.value = true
    done.value = false
    reviewText.value = ''
    error.value = null

    try {
      const res = await fetch('/api/review/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ owner, repo, branch, readmeContent }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'Review failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            done.value = true
            return
          }
          try {
            const { text } = JSON.parse(data)
            if (text) reviewText.value += text
          } catch {}
        }
      }
    } catch (e) {
      error.value = e.message
    } finally {
      streaming.value = false
      done.value = true
    }
  }

  function reset() {
    streaming.value = false
    done.value = false
    reviewText.value = ''
    error.value = null
  }

  return { streaming, done, reviewText, error, startReview, reset }
})
