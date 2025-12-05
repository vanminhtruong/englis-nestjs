<template>
  <div class="p-3 rounded-lg bg-black/5 dark:bg-white/5">
    <div class="flex gap-4">
      <!-- Media Display -->
      <div v-if="vocabulary.image || vocabulary.video" class="flex-shrink-0">
        <!-- Image Display -->
        <button
          v-if="vocabulary.image && !vocabulary.video"
          type="button"
          class="w-24 h-24 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400"
          @click="$emit('open-image', { src: vocabulary.image.startsWith('data:') ? vocabulary.image : `http://localhost:3000${vocabulary.image}`, alt: vocabulary.word })"
        >
          <img 
            :src="vocabulary.image.startsWith('data:') ? vocabulary.image : `http://localhost:3000${vocabulary.image}`" 
            :alt="vocabulary.word" 
            class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
          />
        </button>
        <!-- Video Display -->
        <button
          v-if="vocabulary.video"
          type="button"
          class="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
          @click="$emit('open-video', { src: vocabulary.video, title: vocabulary.word })"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white opacity-70 group-hover:opacity-100 transition-opacity relative z-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z"></path>
          </svg>
        </button>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <h4 class="text-xl font-bold text-black dark:text-white">{{ vocabulary.word }}</h4>
          <button 
            @click="$emit('speak', vocabulary.word)" 
            class="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500 dark:text-primary-400 transition-colors" 
            :title="speakText"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
          <span class="text-sm text-black/50 dark:text-white/60 italic">{{ vocabulary.pronunciation }}</span>
          <button v-if="vocabulary.isFavorite" class="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="text-yellow-500">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>
        <p class="text-black/70 dark:text-white/80 mb-3">{{ vocabulary.meaning }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="px-3 py-1 rounded-lg text-xs font-medium" :class="difficultyClass">
            {{ difficultyText }}
          </span>
          <div v-if="vocabulary.tags && vocabulary.tags.length > 0" class="flex items-center gap-2">
            <span v-for="tag in vocabulary.tags" :key="tag" class="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
              #{{ tag }}
            </span>
          </div>
          <div class="flex gap-2">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs">
              ✓ {{ vocabulary.correctCount || 0 }}
            </span>
            <span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs">
              ✗ {{ vocabulary.incorrectCount || 0 }}
            </span>
          </div>
          <button 
            @click="$emit('view-detail')" 
            class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all ml-auto" 
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  vocabulary: any
  difficultyText: string
  speakText: string
}>()

defineEmits<{
  'open-image': [payload: { src: string; alt: string }]
  'open-video': [payload: { src: string; title: string }]
  speak: [word: string]
  'view-detail': []
}>()

const difficultyClass = computed(() => ({
  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': props.vocabulary.difficulty === 'easy',
  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400': props.vocabulary.difficulty === 'medium',
  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': props.vocabulary.difficulty === 'hard',
}))
</script>
