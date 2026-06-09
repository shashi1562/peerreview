<template>
  <div>
    <label class="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
      Review Instructions (README.md)
    </label>

    <!-- Drop zone -->
    <div
      v-if="!modelValue"
      class="border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
      :class="dragging
        ? 'border-violet-500 bg-violet-500/5'
        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <div class="text-2xl mb-2">📄</div>
      <p class="text-gray-400 text-sm font-medium">Drop README.md here</p>
      <p class="text-gray-600 text-xs mt-1">or click to browse</p>
      <input
        ref="fileInput"
        type="file"
        accept=".md,.txt"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Uploaded preview -->
    <div v-else class="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
        <div class="flex items-center gap-2">
          <span class="text-sm">📄</span>
          <span class="text-sm font-medium text-gray-300">{{ fileName }}</span>
        </div>
        <button
          @click="clear"
          class="text-gray-600 hover:text-gray-400 transition-colors text-xs"
        >
          Remove
        </button>
      </div>
      <!-- Content preview -->
      <pre class="px-4 py-3 text-xs text-gray-500 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">{{ preview }}</pre>
    </div>

    <!-- Paste fallback -->
    <div v-if="!modelValue" class="mt-2">
      <button
        @click="showPaste = !showPaste"
        class="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        {{ showPaste ? '▲ Hide' : '▼ Paste content instead' }}
      </button>
      <textarea
        v-if="showPaste"
        class="mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono leading-relaxed focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-700 resize-none"
        rows="6"
        placeholder="# Review Instructions&#10;You are a senior engineer..."
        @input="onPaste"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const dragging = ref(false)
const fileInput = ref(null)
const fileName = ref('README.md')
const showPaste = ref(false)

const preview = computed(() => {
  if (!props.modelValue) return ''
  const lines = props.modelValue.split('\n')
  return lines.slice(0, 15).join('\n') + (lines.length > 15 ? '\n…' : '')
})

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) readFile(file)
}

function readFile(file) {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => emit('update:modelValue', e.target.result)
  reader.readAsText(file)
}

function onPaste(e) {
  emit('update:modelValue', e.target.value || '')
}

function clear() {
  emit('update:modelValue', '')
  fileName.value = 'README.md'
  if (fileInput.value) fileInput.value.value = ''
}
</script>
