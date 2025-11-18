<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-white/5 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col backdrop-blur-lg">
      <!-- Header -->
      <div class="p-6 border-b border-white/20 dark:border-white/10 flex items-center justify-between flex-shrink-0">
        <h2 class="text-2xl font-bold text-black dark:text-white">
          {{ vocabulary?.word }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content - Scrollable -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Image -->
        <div v-if="vocabulary?.image" class="w-full">
          <img 
            :src="vocabulary.image.startsWith('data:') ? vocabulary.image : `http://localhost:3000${vocabulary.image}`" 
            :alt="vocabulary.word"
            class="w-full h-64 object-cover rounded-xl"
          />
        </div>

        <!-- Word & Pronunciation -->
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-3xl font-bold text-black dark:text-white">
              {{ vocabulary?.word }}
            </h3>
            <button
              @click="handleSpeak"
              class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <button
              v-if="vocabulary?.isFavorite"
              class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all ml-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="text-yellow-500">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
          <p class="text-lg text-black/60 dark:text-white/60 italic">{{ vocabulary?.pronunciation }}</p>
        </div>

        <!-- Meaning -->
        <div>
          <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Meaning</h4>
          <p class="text-lg text-black dark:text-white">{{ vocabulary?.meaning }}</p>
        </div>

        <!-- Example -->
        <div v-if="vocabulary?.example">
          <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Example</h4>
          <div class="p-4 bg-black/5 dark:bg-white/5 rounded-xl">
            <p class="text-black/80 dark:text-white/80 italic mb-2">{{ vocabulary.example }}</p>
            <p v-if="vocabulary.exampleTranslation" class="text-sm text-black/60 dark:text-white/60">
              {{ vocabulary.exampleTranslation }}
            </p>
          </div>
        </div>

        <!-- Meta Info -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Difficulty -->
          <div>
            <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Difficulty</h4>
            <span
              :class="{
                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400': vocabulary?.difficulty === 'easy',
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400': vocabulary?.difficulty === 'medium',
                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400': vocabulary?.difficulty === 'hard',
              }"
              class="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
            >
              {{ vocabulary?.difficulty }}
            </span>
          </div>

          <!-- Stats -->
          <div>
            <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Practice Stats</h4>
            <div class="flex gap-2">
              <span class="px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold">
                ✓ {{ vocabulary?.correctCount || 0 }}
              </span>
              <span class="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                ✗ {{ vocabulary?.incorrectCount || 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div v-if="vocabulary?.categories && vocabulary.categories.length > 0">
          <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Categories</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="category in vocabulary.categories"
              :key="category.id"
              class="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium"
              :style="{ backgroundColor: category.color + '20', color: category.color }"
            >
              <component
                :is="getIconComponent(category.icon)"
                :color="category.color"
                class="w-4 h-4"
              />
              {{ category.name }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="vocabulary?.tags && vocabulary.tags.length > 0">
          <h4 class="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">Tags</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in vocabulary.tags"
              :key="tag"
              class="px-3 py-2 bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 rounded-lg text-sm"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer - Fixed -->
      <div class="p-6 border-t border-white/20 dark:border-white/10 flex gap-3 flex-shrink-0">
        <button
          @click="handleEdit"
          class="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button
          @click="$emit('close')"
          class="flex-1 py-3 px-4 bg-black/10 dark:bg-white/10 text-black dark:text-white font-semibold rounded-xl hover:bg-black/20 dark:hover:bg-white/20 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { getIconComponent } from '../utils/iconRenderer'
import { useModalScrollLock } from '../composables/useModalScrollLock'
import { getPreferredVoice } from '../composables/usePreferredVoice'

const props = defineProps<{
  show: boolean
  vocabulary: any
}>()

const { lockScroll, unlockScroll } = useModalScrollLock()

watch(() => props.show, (newValue) => {
  if (newValue) {
    lockScroll()
  } else {
    unlockScroll()
  }
})

const emit = defineEmits<{
  close: []
  edit: [vocabulary: any]
}>()

function handleSpeak() {
  if (!props.vocabulary?.word || !('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(props.vocabulary.word)
  const voice = getPreferredVoice('en-US')
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = 'en-US'
  }
  utterance.rate = 0.8
  window.speechSynthesis.speak(utterance)
}

function handleEdit() {
  emit('edit', props.vocabulary)
  emit('close')
}
</script>
