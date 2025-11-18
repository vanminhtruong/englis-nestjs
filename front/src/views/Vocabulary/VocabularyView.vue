<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <VocabularyHeader
          :title="t('vocabulary.title')"
          :grid-label="t('vocabulary.gridView')"
          :list-label="t('vocabulary.listView')"
          :is-grid-layout="vocabularyState.isGridLayout"
          :is-persisting-layout="vocabularyState.isPersistingLayout"
          @change:layout="vocabularyLayoutHandle.handleLayoutModeChange"
        />

        <VocabularyControls
          :search="vocabularyState.filter.search"
          :difficulty-label="t(vocabularyState.difficultyLabel)"
          :show-difficulty-dropdown="vocabularyState.showDifficultyDropdown"
          :current-difficulty="vocabularyState.filter.difficulty"
          :labels="{
            searchPlaceholder: t('vocabulary.search'),
            addNew: t('vocabulary.addNew'),
            all: t('vocabulary.all'),
            easy: t('vocabulary.easy'),
            medium: t('vocabulary.medium'),
            hard: t('vocabulary.hard'),
          }"
          @update:search="(value) => (vocabularyState.filter.search = value)"
          @toggle-difficulty="vocabularyState.showDifficultyDropdown = !vocabularyState.showDifficultyDropdown"
          @set-difficulty="vocabularyState.setDifficultyFilter"
          @create="vocabularyState.openCreateModal"
        />
      </div>

      <div v-if="vocabularyState.store.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <div v-else-if="vocabularyState.filteredVocabularies.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('vocabulary.noVocabulary') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('vocabulary.addFirstVocabulary') }}</p>
        <button
          @click="vocabularyState.openCreateModal"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t('vocabulary.addNew') }}
        </button>
      </div>

      <div v-else>
        <VocabularyGrid
          v-if="vocabularyState.isGridLayout"
          :vocabularies="vocabularyState.filteredVocabularies"
          :t="t"
          :format-date="formatDate"
          @speak="vocabularyHandle.handleSpeak"
          @toggle-pin="vocabularyHandle.handleTogglePin"
          @toggle-favorite="vocabularyHandle.handleToggleFavorite"
          @open-detail="vocabularyState.openDetailModal"
          @open-edit="vocabularyState.openEditModal"
          @delete="vocabularyHandle.handleDelete"
          @open-image="openImagePreview"
        />

        <VocabularyList
          v-else
          :vocabularies="vocabularyState.filteredVocabularies"
          :t="t"
          :format-date="formatDate"
          @speak="vocabularyHandle.handleSpeak"
          @toggle-pin="vocabularyHandle.handleTogglePin"
          @toggle-favorite="vocabularyHandle.handleToggleFavorite"
          @open-detail="vocabularyState.openDetailModal"
          @open-edit="vocabularyState.openEditModal"
          @delete="vocabularyHandle.handleDelete"
          @open-image="openImagePreview"
        />
      </div>

      <Pagination
        v-if="vocabularyState.filteredVocabularies.length > 0 && vocabularyState.store.pageCount > 1"
        :page="vocabularyState.store.page"
        :page-count="vocabularyState.store.pageCount"
        @update:page="vocabularyFilterHandle.handlePageChange"
        @page-change="vocabularyFilterHandle.handlePageChange"
      />
    </div>

    <VocabularyModal
      :show="vocabularyState.showModal"
      :isEditing="vocabularyState.isEditing"
      :form="vocabularyState.form"
      :t="t"
      @submit="vocabularyHandle.handleSubmit"
      @close="vocabularyState.closeModal"
    />

    <VocabularyDetailModal
      :show="vocabularyState.showDetailModal"
      :vocabulary="vocabularyState.selectedVocabulary"
      @close="vocabularyState.closeDetailModal"
      @edit="vocabularyState.handleEditFromDetail"
    />

    <VocabularyImageViewer
      :visible="imagePreview.visible"
      :src="imagePreview.src"
      :alt="imagePreview.alt"
      :title="imagePreview.title"
      @close="closeImagePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, proxyRefs, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVocabularyState } from './composable/manager-state/useVocabularyState'
import { useVocabularyHandle } from './composable/manager-handle/useVocabularyHandle'
import { useVocabularyMount } from './composable/manager-mount/useVocabularyMount'
import { useVocabularyFilterHandle } from './composable/manager-handle/useVocabularyFilterHandle'
import { useVocabularyLayoutHandle } from './composable/manager-handle/useVocabularyLayoutHandle'
import enLang from './language/en'
import viLang from './language/vi'
import koLang from './language/ko'

const VocabularyHeader = defineAsyncComponent(() => import('./component/VocabularyHeader.vue') as any)
const VocabularyControls = defineAsyncComponent(() => import('./component/VocabularyControls.vue') as any)
const VocabularyGrid = defineAsyncComponent(() => import('./component/VocabularyGrid.vue') as any)
const VocabularyList = defineAsyncComponent(() => import('./component/VocabularyList.vue') as any)
const VocabularyModal = defineAsyncComponent(() => import('./component/VocabularyModal.vue') as any)
const VocabularyDetailModal = defineAsyncComponent(() => import('../../components/VocabularyDetailModal.vue') as any)
const VocabularyImageViewer = defineAsyncComponent(() => import('../../components/common/VocabularyImageViewer.vue') as any)
const Pagination = defineAsyncComponent(() => import('../../components/Pagination.vue') as any)

const { t, locale, mergeLocaleMessage } = useI18n()

mergeLocaleMessage('en', { vocabulary: enLang })
mergeLocaleMessage('vi', { vocabulary: viLang })
mergeLocaleMessage('ko', { vocabulary: koLang })

const vocabularyStateStore = useVocabularyState()
const vocabularyState = proxyRefs(vocabularyStateStore)

const vocabularyHandle = useVocabularyHandle(
  vocabularyStateStore.form,
  vocabularyStateStore.isEditing,
  vocabularyStateStore.editingId,
  vocabularyStateStore.closeModal,
)

const vocabularyFilterHandle = useVocabularyFilterHandle(vocabularyStateStore.filter, vocabularyStateStore.store)

const vocabularyLayoutHandle = useVocabularyLayoutHandle(
  vocabularyStateStore.layoutMode,
  vocabularyStateStore.filter,
  vocabularyStateStore.store,
  vocabularyStateStore.isPersistingLayout,
)

const imagePreview = reactive({
  visible: false,
  src: '',
  alt: '',
  title: '',
})

function openImagePreview(payload: { src: string; alt: string }) {
  imagePreview.src = payload.src
  imagePreview.alt = payload.alt
  imagePreview.title = payload.alt
  imagePreview.visible = true
}

function closeImagePreview() {
  imagePreview.visible = false
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const localeMap: Record<string, string> = {
    en: 'en-US',
    vi: 'vi-VN',
    ko: 'ko-KR',
  }
  return date.toLocaleDateString(localeMap[locale.value] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

useVocabularyMount()
</script>
