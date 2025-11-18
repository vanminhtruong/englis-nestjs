<template>
  <div class="min-h-screen bg-white dark:bg-black py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
          {{ tr('title') }}
        </h1>
        <p class="text-lg text-black/60 dark:text-white/70">
          {{ tr('subtitle') }}
        </p>
      </div>

      <!-- Actions Bar -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="'Search vocabularies...'"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-3 top-3 h-5 w-5 text-black/40 dark:text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Expand/Collapse All Button -->
        <button
          @click="toggleExpandAll"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2"
        >
          <svg v-if="!expandAll" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="7 13 12 18 17 13"></polyline>
            <polyline points="7 6 12 11 17 6"></polyline>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17 11 12 6 7 11"></polyline>
            <polyline points="17 18 12 13 7 18"></polyline>
          </svg>
          {{ expandAll ? tr('collapseAll') : tr('expandAll') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400"></div>
      </div>

      <!-- No Data State -->
      <div v-else-if="filteredVocabularies.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">📅</div>
        <h3 class="text-2xl font-bold text-black dark:text-white mb-2">{{ tr('noData') }}</h3>
        <p class="text-black/60 dark:text-white/70">{{ tr('subtitle') }}</p>
      </div>

      <!-- Date Groups -->
      <div v-else class="space-y-6">
        <div
          v-for="group in filteredVocabularies"
          :key="group.date"
          class="bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-white/10 shadow-lg overflow-hidden"
        >
          <!-- Date Header -->
          <button
            @click="toggleDate(group.date)"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-500 dark:bg-primary-600 flex items-center justify-center text-white font-bold">
                {{ new Date(group.date).getDate() }}
              </div>
              <div class="text-left">
                <h3 class="text-lg font-semibold text-black dark:text-white">
                  {{ formatDate(group.date) }}
                </h3>
                <p class="text-sm text-black/50 dark:text-white/60">
                  {{ group.count }} {{ tr('wordsCount') }}
                </p>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-black/40 dark:text-white/50 transition-transform"
              :class="{ 'rotate-180': isDateExpanded(group.date) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <!-- Vocabularies List -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[10000px]"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 max-h-[10000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="isDateExpanded(group.date)" class="border-t border-black/10 dark:border-white/10 p-4 space-y-4">
              <div v-for="catGroup in group.categories" :key="catGroup.category.id">
                <button @click="toggleCategory(group.date, catGroup.category.id)" class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                  <div class="flex items-center gap-2">
                    <component :is="getIconComponent(catGroup.category.icon)" :color="catGroup.category.color" class="w-5 h-5" />
                    <span class="font-semibold">{{ catGroup.category.name }}</span>
                    <span class="text-sm text-black/50 dark:text-white/60">({{ catGroup.vocabularies.length }})</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500 dark:text-primary-400 transition-colors"
                      :title="tr('moveToDate')"
                      @click.stop="openMoveModal(group.date, catGroup.category.id, catGroup.category.name)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                      </svg>
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black/40 dark:text-white/50 transition-transform" :class="{ 'rotate-180': isCategoryExpanded(group.date, catGroup.category.id) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                <div v-if="isCategoryExpanded(group.date, catGroup.category.id)" class="pl-8 pt-2 space-y-2">
                  <div v-for="vocab in catGroup.vocabularies" :key="vocab.id" class="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                    <div class="flex gap-4">
                      <!-- Media Display -->
                      <div v-if="vocab.image || vocab.video" class="flex-shrink-0">
                        <!-- Image Display -->
                        <button
                          v-if="vocab.image && !vocab.video"
                          type="button"
                          class="w-24 h-24 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary-400"
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
                          class="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary-400 relative"
                          @click="openVideoPreview({ src: vocab.video, title: vocab.word })"
                        >
                          <div class="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white opacity-70 group-hover:opacity-100 transition-opacity relative z-10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 3l14 9-14 9V3z"></path>
                          </svg>
                        </button>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-2">
                          <h4 class="text-xl font-bold text-black dark:text-white">{{ vocab.word }}</h4>
                          <button @click="handleSpeak(vocab.word)" class="p-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-500 dark:text-primary-400 transition-colors" :title="tr('speak')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                            </svg>
                          </button>
                          <span class="text-sm text-black/50 dark:text-white/60 italic">{{ vocab.pronunciation }}</span>
                          <button v-if="vocab.isFavorite" class="p-1 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="text-yellow-500">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </button>
                        </div>
                        <p class="text-black/70 dark:text-white/80 mb-3">{{ vocab.meaning }}</p>
                        <div class="flex flex-wrap items-center gap-3">
                          <span class="px-3 py-1 rounded-lg text-xs font-medium" :class="{
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': vocab.difficulty === 'easy',
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400': vocab.difficulty === 'medium',
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400': vocab.difficulty === 'hard',
                          }">{{ tr(vocab.difficulty) }}</span>
                          <div v-if="vocab.tags && vocab.tags.length > 0" class="flex items-center gap-2">
                            <span v-for="tag in vocab.tags" :key="tag" class="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">#{{ tag }}</span>
                          </div>
                          <div class="flex gap-2">
                            <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs">✓ {{ vocab.correctCount || 0 }}</span>
                            <span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs">✗ {{ vocab.incorrectCount || 0 }}</span>
                          </div>
                          <button @click="openDetailModal(vocab)" class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all ml-auto" title="View Details">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
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

    <!-- Move Category Modal -->
    <div
      v-if="showMoveModal"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 dark:bg-black/60"
    >
      <div class="bg-white dark:bg-black rounded-2xl shadow-xl border border-black/10 dark:border-white/10 w-full max-w-md p-6">
        <h2 class="text-xl font-semibold text-black dark:text-white mb-4">
          {{ tr('moveModalTitle') }}
        </h2>
        <p class="text-sm text-black/70 dark:text-white/70 mb-4">
          {{ tr('moveModalDescription') }}
        </p>

        <div class="space-y-4 mb-6">
          <div>
            <div class="text-xs font-medium text-black/60 dark:text-white/60 mb-1">
              {{ tr('fromDate') }}
            </div>
            <div class="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm text-black dark:text-white">
              {{ formatDate(moveFromDate) }} — {{ moveCategoryName }}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-black/60 dark:text-white/60 mb-1">
              {{ tr('toDate') }}
            </label>
            <div class="relative">
              <button
                type="button"
                @click="showTargetDateDropdown = !showTargetDateDropdown"
                class="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent flex items-center justify-between"
              >
                <span class="text-sm truncate">
                  {{ selectedTargetDateLabel }}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" :class="{ 'rotate-180': showTargetDateDropdown }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              <div
                v-if="showTargetDateDropdown"
                class="absolute z-10 w-full mt-2 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto"
              >
                <button
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-black dark:text-white text-sm"
                  @click="selectTargetDate('')"
                >
                  -- {{ tr('selectDatePlaceholder') }} --
                </button>
                <button
                  v-for="date in availableTargetDates"
                  :key="date"
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm"
                  :class="{ 'bg-primary-50 dark:bg-primary-900/20': selectedTargetDate === date }"
                  @click="selectTargetDate(date)"
                >
                  <span class="text-black dark:text-white">{{ formatDate(date) }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-xl border border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium"
            @click="closeMoveModal"
          >
            {{ tr('cancel') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold shadow hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!selectedTargetDate"
            @click="confirmMove"
          >
            {{ tr('confirmMove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVocabularyByDateState } from './composable/manager-state/useVocabularyByDateState'
import { useVocabularyByDateHandle } from './composable/manager-handle/useVocabularyByDateHandle'
import { useVocabularyByDateMount } from './composable/manager-mount/useVocabularyByDateMount'
import { getIconComponent } from '../../utils/iconRenderer'

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

const { t } = useI18n({ useScope: 'global' })

function tr(key: string) {
  return t(`vocabularyByDate.${key}`)
}

const {
  vocabulariesByDate,
  loading,
  expandedDates,
  expandedCategories,
  expandAll,
  searchQuery,
} = useVocabularyByDateState()

const { 
  loadData, 
  handleSpeak, 
  formatDate, 
  getDifficultyColor,
  filteredVocabularies,
  toggleDate,
  toggleExpandAll,
  isDateExpanded,
  toggleCategory,
  isCategoryExpanded,
  moveCategoryToDate,
} = useVocabularyByDateHandle(
  vocabulariesByDate,
  loading,
  searchQuery,
  expandedDates,
  expandedCategories,
  expandAll
)

useVocabularyByDateMount(loadData)

const showMoveModal = ref(false)
const moveFromDate = ref('')
const moveCategoryId = ref('')
const moveCategoryName = ref('')
const selectedTargetDate = ref('')
const showTargetDateDropdown = ref(false)

const availableTargetDates = computed(() => {
  if (!moveFromDate.value) return []
  return vocabulariesByDate.value
    .map((g) => g.date)
    .filter((d) => d !== moveFromDate.value)
})

function openMoveModal(date: string, categoryId: string, categoryName: string) {
  moveFromDate.value = date
  moveCategoryId.value = categoryId
  moveCategoryName.value = categoryName
  selectedTargetDate.value = ''
  showTargetDateDropdown.value = false
  showMoveModal.value = true
}

function closeMoveModal() {
  showMoveModal.value = false
  showTargetDateDropdown.value = false
}

async function confirmMove() {
  if (!selectedTargetDate.value || !moveFromDate.value || !moveCategoryId.value) return
  await moveCategoryToDate(moveFromDate.value, selectedTargetDate.value, moveCategoryId.value)
  showMoveModal.value = false
  showTargetDateDropdown.value = false
}

const selectedTargetDateLabel = computed(() => {
  if (!selectedTargetDate.value) return tr('selectDatePlaceholder')
  const group = vocabulariesByDate.value.find((g) => g.date === selectedTargetDate.value)
  return group ? formatDate(group.date) : tr('selectDatePlaceholder')
})

function selectTargetDate(date: string) {
  selectedTargetDate.value = date
  showTargetDateDropdown.value = false
}
</script>
