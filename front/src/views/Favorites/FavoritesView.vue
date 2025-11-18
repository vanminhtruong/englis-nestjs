<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-4">
          {{ t('favorites.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ favoritesCount }} {{ t('favorites.title').toLowerCase() }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasFavorites" class="text-center py-12">
        <div class="text-6xl mb-4">⭐</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('favorites.noFavorites') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('favorites.addFavoriteHint') }}</p>
        <RouterLink
          to="/vocabulary"
          class="inline-flex px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t('favorites.goToVocabulary') }}
        </RouterLink>
      </div>

      <!-- Favorites Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="vocab in favorites"
          :key="vocab.id"
          class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all"
        >
          <!-- Media Display -->
          <div v-if="vocab.image || vocab.video" class="w-full h-40 mb-4 rounded-xl overflow-hidden">
            <!-- Image Display -->
            <button
              v-if="vocab.image && !vocab.video"
              type="button"
              class="w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-400"
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
              class="w-full h-full group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
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
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"></path>
                </svg>
              </div>
            </button>
          </div>
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ vocab.word }}
                </h3>
                <button
                  @click="handleSpeak(vocab.word)"
                  class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  :title="t('favorites.speak')"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ vocab.pronunciation }}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <button
                @click="handleToggleFavorite(vocab.id)"
                class="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
                :title="t('favorites.unfavorite')"
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
                {{ t('favorites.' + vocab.difficulty) }}
              </span>
            </div>
          </div>

          <p class="text-gray-700 dark:text-gray-300 mb-4">{{ vocab.meaning }}</p>

          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">✓ {{ vocab.correctCount || 0 }}</span>
            <span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium">✗ {{ vocab.incorrectCount || 0 }}</span>
            <span v-for="tag in vocab.tags" :key="tag" class="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">#{{ tag }}</span>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('favorites.createdAt') }}: {{ formatDate(vocab.createdAt) }}
            </p>
            <button @click="openDetailModal(vocab)" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="View Details">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Pagination
        v-if="hasFavorites && pageCount > 1"
        :page="page"
        :page-count="pageCount"
        @update:page="handlePageChange"
        @page-change="handlePageChange"
      />
      <VocabularyDetailModal :show="showDetailModal" :vocabulary="selectedVocabulary" @close="closeDetailModal" @open-image="openImagePreview" />
      <VocabularyImageViewer
        :visible="imagePreview.visible"
        :src="imagePreview.src"
        :alt="imagePreview.alt"
        :title="imagePreview.alt"
        @close="closeImagePreview"
      />
      <VideoZoomModal
        :visible="videoPreview.visible"
        :src="videoPreview.src"
        :title="videoPreview.title"
        @close="closeVideoPreview"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFavoritesState } from './composable/manager-state/useFavoritesState'
import { useFavoritesHandle } from './composable/manager-handle/useFavoritesHandle'
import { useFavoritesMount } from './composable/manager-mount/useFavoritesMount'
import enLang from './language/en'
import viLang from './language/vi'
import koLang from './language/ko'

const { t, mergeLocaleMessage } = useI18n()

// Register language cho favorites view
mergeLocaleMessage('en', { favorites: enLang })
mergeLocaleMessage('vi', { favorites: viLang })
mergeLocaleMessage('ko', { favorites: koLang })

const VocabularyDetailModal = defineAsyncComponent(() => import('../../components/VocabularyDetailModal.vue') as any)
const VocabularyImageViewer = defineAsyncComponent(() => import('../../components/common/VocabularyImageViewer.vue') as any)
const VideoZoomModal = defineAsyncComponent(() => import('../../components/common/VideoZoomModal.vue') as any)
const Pagination = defineAsyncComponent(() => import('../../components/Pagination.vue') as any)

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

const {
  favorites,
  loading,
  favoritesCount,
  hasFavorites,
  page,
  limit,
  pageCount,
  setMeta,
  setPage,
  setFavorites,
  removeFavorite,
  setLoading,
} = useFavoritesState()

const {
  loadFavorites,
  handleToggleFavorite,
  handleSpeak,
  formatDate,
} = useFavoritesHandle(setFavorites, removeFavorite, setLoading, setMeta, page, limit)

useFavoritesMount(loadFavorites)

function handlePageChange(p: number) {
  setPage(p)
  loadFavorites(p)
}
</script>
