<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Content -->
      <div v-else-if="category">
        <!-- Header -->
        <div class="mb-8">
          <RouterLink
            to="/categories"
            class="inline-flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-primary-500 dark:hover:text-primary-400 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {{ t('categories.title') }}
          </RouterLink>

          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center"
              :style="{ backgroundColor: category.color + '30' }"
            >
              <component
                :is="getIconComponent(category.icon)"
                :color="category.color"
                class="w-10 h-10"
              />
            </div>
            <div>
              <h1 class="text-4xl font-bold text-black dark:text-white">
                {{ category.name }}
              </h1>
              <p v-if="category.description" class="text-black/60 dark:text-white/60 mt-1">
                {{ category.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Vocabularies by Date -->
        <div v-if="vocabulariesByDate.length > 0" class="space-y-8">
          <div v-for="group in vocabulariesByDate" :key="group.date">
            <h2 class="text-2xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ group.date }}
              <span class="text-sm text-black/50 dark:text-white/50 font-normal">
                ({{ group.vocabularies.length }} {{ t('vocabulary.words') || 'words' }})
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="vocab in group.vocabularies"
                :key="vocab.id"
                class="bg-gradient-to-br from-white to-white/50 dark:from-white/5 dark:to-white/[0.02] border border-black/10 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all"
              >
                <!-- Media Preview -->
                <div v-if="vocab.image || vocab.video" class="mb-4">
                  <!-- Image Display -->
                  <button
                    v-if="vocab.image && !vocab.video"
                    type="button"
                    class="w-full h-32 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400"
                    @click="openImagePreview({ src: vocab.image.startsWith('data:') ? vocab.image : `http://localhost:3000${vocab.image}`, alt: vocab.word })"
                  >
                    <img 
                      :src="vocab.image.startsWith('data:') ? vocab.image : `http://localhost:3000${vocab.image}`" 
                      :alt="vocab.word"
                      class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>
                  <!-- Video Display -->
                  <button
                    v-if="vocab.video"
                    type="button"
                    class="w-full h-32 rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
                    @click="openVideoPreview({ src: vocab.video, title: vocab.word })"
                  >
                    <img 
                      v-if="getVideoThumbnail(vocab.video)"
                      :src="getVideoThumbnail(vocab.video)"
                      :alt="vocab.word"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
                    <div class="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 3l14 9-14 9V3z"></path>
                      </svg>
                    </div>
                  </button>
                </div>

                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="text-2xl font-bold text-black dark:text-white">
                        {{ vocab.word }}
                      </h3>
                      <button
                        @click="handleSpeak(vocab.word)"
                        class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      </button>
                    </div>
                    <p class="text-sm text-black/50 dark:text-white/50">{{ vocab.pronunciation }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <button
                      v-if="vocab.isFavorite"
                      class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="text-yellow-500">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    </button>
                    <span
                      :class="{
                        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400': vocab.difficulty === 'easy',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400': vocab.difficulty === 'medium',
                        'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400': vocab.difficulty === 'hard',
                      }"
                      class="px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {{ vocab.difficulty }}
                    </span>
                  </div>
                </div>

                <p class="text-black/70 dark:text-white/70 mb-4">{{ vocab.meaning }}</p>

                <div class="flex items-center justify-between mb-4">
                  <div class="flex gap-2">
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs">
                      ✓ {{ vocab.correctCount }}
                    </span>
                    <span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs">
                      ✗ {{ vocab.incorrectCount }}
                    </span>
                  </div>
                  <button
                    @click="openDetailModal(vocab)"
                    class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>

                <div v-if="vocab.categories && vocab.categories.length > 0" class="flex flex-wrap gap-2 mt-4">
                  <span
                    v-for="cat in vocab.categories"
                    :key="cat.id"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                    :style="{ backgroundColor: cat.color + '20', color: cat.color }"
                  >
                    <component
                      :is="getIconComponent(cat.icon)"
                      :color="cat.color"
                      class="w-3 h-3"
                    />
                    {{ cat.name }}
                  </span>
                </div>

                <div v-if="vocab.tags && vocab.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                  <span
                    v-for="tag in vocab.tags"
                    :key="tag"
                    class="px-2 py-1 bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 rounded-lg text-xs"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-2xl font-bold text-black dark:text-white mb-2">No vocabularies in this category</h3>
          <p class="text-black/60 dark:text-white/60">Add vocabularies to this category from the vocabulary page</p>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      :show="showDetailModal"
      :vocabulary="selectedVocabulary"
      @close="closeDetailModal"
      @open-image="openImagePreview"
    />

    <!-- Image Preview Modal -->
    <VocabularyImageViewer
      :visible="imagePreview.visible"
      :src="imagePreview.src"
      :alt="imagePreview.alt"
      :title="imagePreview.alt"
      @close="closeImagePreview"
    />

    <!-- Video Preview Modal -->
    <VideoZoomModal
      :visible="videoPreview.visible"
      :src="videoPreview.src"
      :title="videoPreview.title"
      @close="closeVideoPreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { categoriesService } from './service/categories.service'
import { getIconComponent } from '../../utils/iconRenderer'
import type { Category } from './interface/category.interface'
import enLang from './language/en'
import viLang from './language/vi'
import koLang from './language/ko'

const VocabularyDetailModal = defineAsyncComponent(() => import('../../components/VocabularyDetailModal.vue') as any)
const VocabularyImageViewer = defineAsyncComponent(() => import('../../components/common/VocabularyImageViewer.vue') as any)
const VideoZoomModal = defineAsyncComponent(() => import('../../components/common/VideoZoomModal.vue') as any)

const showDetailModal = ref(false)
const selectedVocabulary = ref(null)

const imagePreview = ref({
  visible: false,
  src: '',
  alt: '',
})

const videoPreview = ref({
  visible: false,
  src: '',
  title: '',
})

function openDetailModal(vocab: any) {
  selectedVocabulary.value = vocab
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedVocabulary.value = null
}

function openImagePreview(payload: { src: string; alt: string }) {
  imagePreview.value.src = payload.src
  imagePreview.value.alt = payload.alt
  imagePreview.value.visible = true
}

function closeImagePreview() {
  imagePreview.value.visible = false
}

function openVideoPreview(payload: { src: string; title: string }) {
  videoPreview.value.src = payload.src
  videoPreview.value.title = payload.title
  videoPreview.value.visible = true
}

function closeVideoPreview() {
  videoPreview.value.visible = false
}

const { t, mergeLocaleMessage } = useI18n()
mergeLocaleMessage('en', { categories: enLang })
mergeLocaleMessage('vi', { categories: viLang })
mergeLocaleMessage('ko', { categories: koLang })

const route = useRoute()
const category = ref<Category | null>(null)
const loading = ref(true)

const vocabulariesByDate = computed(() => {
  if (!category.value?.vocabularies) return []

  const grouped = category.value.vocabularies.reduce((acc: any, vocab: any) => {
    const date = new Date(vocab.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(vocab)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([date, vocabularies]) => ({ date, vocabularies }))
    .sort((a: any, b: any) => new Date(b.vocabularies[0].createdAt).getTime() - new Date(a.vocabularies[0].createdAt).getTime())
})

import { getPreferredVoice } from '../../composables/usePreferredVoice'

function handleSpeak(word: string) {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance(word)
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

function getVideoThumbnail(videoUrl: string) {
  if (!videoUrl) return ''
  
  // YouTube URL
  if (videoUrl.includes('youtube.com/embed/')) {
    const videoId = videoUrl.split('youtube.com/embed/')[1]?.split('?')[0]
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
  
  // Vimeo URL
  if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
    if (videoId) return `https://vimeo.com/api/v2/video/${videoId}.json`
  }
  
  return ''
}

onMounted(async () => {
  const id = route.params.id as string
  const result = await categoriesService.getCategoryWithVocabularies(id)
  if (result.success) {
    category.value = result.data
  }
  loading.value = false
})
</script>
