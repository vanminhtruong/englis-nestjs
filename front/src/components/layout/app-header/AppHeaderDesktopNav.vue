<template>
  <nav class="hidden xl:flex items-center gap-2 flex-1">
    <RouterLink
      to="/"
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
    >
      <SeasonalHeaderIcon kind="home">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </SeasonalHeaderIcon>
      <span class="whitespace-nowrap">{{ t('header.home') }}</span>
    </RouterLink>

    <div v-if="authStore.isAuthenticated" class="relative" @mouseenter="isVocabMenuOpen = true" @mouseleave="isVocabMenuOpen = false">
      <button
        type="button"
        :aria-expanded="isVocabMenuOpen"
        aria-haspopup="true"
        @click="isVocabMenuOpen = !isVocabMenuOpen"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
      >
        <SeasonalHeaderIcon kind="vocabulary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </SeasonalHeaderIcon>
        <span class="whitespace-nowrap">{{ t('header.vocabulary') }}</span>
        <SeasonalHeaderIcon kind="chevron" :size="16" :expanded="isVocabMenuOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </SeasonalHeaderIcon>
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isVocabMenuOpen"
          @mouseenter="isVocabMenuOpen = true"
          @mouseleave="isVocabMenuOpen = false"
          class="absolute top-full left-0 w-60 bg-white dark:bg-black/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
        >
          <div class="p-2">
            <RouterLink
              to="/vocabulary"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            >
              <SeasonalHeaderIcon kind="vocabulary" compact>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </SeasonalHeaderIcon>
              <span class="font-medium">{{ t('header.allVocabularies') }}</span>
            </RouterLink>
            <RouterLink
              to="/vocabulary/by-date"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            >
              <SeasonalHeaderIcon kind="calendar" compact>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </SeasonalHeaderIcon>
              <span class="font-medium">{{ t('header.byLearningDate') }}</span>
            </RouterLink>
            <RouterLink
              to="/categories"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            >
              <SeasonalHeaderIcon kind="categories" compact>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </SeasonalHeaderIcon>
              <span class="font-medium">{{ t('header.categories') }}</span>
            </RouterLink>
            <RouterLink
              to="/srs"
              @click="isVocabMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            >
              <SeasonalHeaderIcon kind="review" compact>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-3l2.5 1M4 17l2.5 1a7 7 0 0 0 12-3"/></svg>
              </SeasonalHeaderIcon>
              <span class="font-medium">{{ t('header.srs') }}</span>
            </RouterLink>
            <RouterLink
              to="/tags"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            >
              <SeasonalHeaderIcon kind="tag" compact>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 7h.01" />
                  <path d="M3 3h18v4H3z" />
                  <path d="M5 7v14l7-3 7 3V7" />
                </svg>
              </SeasonalHeaderIcon>
              <span class="font-medium">{{ t('header.tags') }}</span>
            </RouterLink>
          </div>
        </div>
      </Transition>
    </div>

    <RouterLink
      v-if="authStore.isAuthenticated"
      to="/practice"
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
    >
      <SeasonalHeaderIcon kind="practice">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </SeasonalHeaderIcon>
      <span class="whitespace-nowrap">{{ t('header.practice') }}</span>
    </RouterLink>


    <RouterLink
      to="/about"
      class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
    >
      <SeasonalHeaderIcon kind="about">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </SeasonalHeaderIcon>
      <span class="whitespace-nowrap">{{ t('header.about') }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SeasonalHeaderIcon from './SeasonalHeaderIcon.vue'
import { useAuthStore } from '../../../stores/auth.store'

const { t } = useI18n()
const authStore = useAuthStore()
const isVocabMenuOpen = ref(false)
</script>
