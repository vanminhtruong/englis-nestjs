<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
            {{ t('categories.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ categoriesCount }} {{ t('categories.title').toLowerCase() }}
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {{ t('categories.addNew') }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasCategories" class="text-center py-12">
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ t('categories.noCategories') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ t('categories.addFirstCategory') }}</p>
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all group"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: category.color + '20' }"
            >
              <component :is="getIconComponent(category.icon)" :color="category.color" class="w-6 h-6" />
            </div>
            <div class="flex gap-2">
              <button
                @click="handleTogglePin(category.id)"
                :class="[
                  'p-2 rounded-lg transition-all text-xl',
                  category.isPinned
                    ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                    : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
                ]"
                :title="category.isPinned ? t('categories.unpin') : t('categories.pin')"
              >
                <span
                  aria-hidden="true"
                  :style="!category.isPinned ? 'filter: grayscale(1);' : ''"
                >
                  📌
                </span>
              </button>
              <button
                @click="openEditModal(category)"
                class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                @click="handleDelete(category.id)"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ category.name }}
          </h3>
          
          <p v-if="category.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {{ category.description }}
          </p>

          <RouterLink
            :to="`/categories/${category.id}`"
            class="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ category.vocabularies?.length || 0 }} {{ t('categories.vocabularyCount') }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <CategoryModal
      :show="showModal"
      :isEditing="isEditing"
      :form="form"
      @submit="handleSubmit"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCategoriesState } from './composable/manager-state/useCategoriesState'
import { useCategoriesHandle } from './composable/manager-handle/useCategoriesHandle'
import { useCategoriesMount } from './composable/manager-mount/useCategoriesMount'
import { getIconComponent } from '../../utils/iconRenderer'
import enLang from './language/en'
import viLang from './language/vi'
import koLang from './language/ko'

const CategoryModal = defineAsyncComponent(() => import('./component/CategoryModal.vue') as any)

const { t, mergeLocaleMessage } = useI18n()

mergeLocaleMessage('en', { categories: enLang })
mergeLocaleMessage('vi', { categories: viLang })
mergeLocaleMessage('ko', { categories: koLang })

const {
  categories,
  loading,
  showModal,
  isEditing,
  editingId,
  form,
  categoriesCount,
  hasCategories,
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setLoading,
  openCreateModal,
  openEditModal,
  closeModal,
} = useCategoriesState()

const { handleSubmit, handleDelete, handleTogglePin } = useCategoriesHandle(
  form,
  isEditing,
  editingId,
  closeModal,
  addCategory,
  updateCategory,
  removeCategory
)

useCategoriesMount(setCategories, setLoading, addCategory, updateCategory, removeCategory)
</script>
