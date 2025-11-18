<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="isOpen" class="lg:hidden px-4 py-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
      <nav class="flex flex-col gap-1">
        <RouterLink
          @click="$emit('close-menu')"
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span>{{ t('header.home') }}</span>
        </RouterLink>
        <div
          v-if="isAuthenticated"
          class="rounded-lg border border-transparent hover:border-primary-100 dark:hover:border-white/10 transition-colors"
        >
          <button
            type="button"
            @click="$emit('toggle-vocab-menu')"
            class="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
          >
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>{{ t('header.vocabulary') }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="['transition-transform', { 'rotate-180': isMobileVocabMenuOpen }]"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="isMobileVocabMenuOpen" class="flex flex-col gap-1 px-2 pb-3">
              <RouterLink
                @click="$emit('close-menus')"
                to="/vocabulary"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span>{{ t('header.allVocabularies') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-menus')"
                to="/vocabulary/by-date"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{{ t('header.byLearningDate') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-menus')"
                to="/categories"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>{{ t('header.categories') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-menus')"
                to="/tags"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 7h.01" />
                  <path d="M3 3h18v4H3z" />
                  <path d="M5 7v14l7-3 7 3V7" />
                </svg>
                <span>{{ t('header.tags') }}</span>
              </RouterLink>
            </div>
          </Transition>
        </div>
        <RouterLink
          v-if="isAuthenticated"
          @click="$emit('close-menu')"
          to="/practice"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span>{{ t('header.practice') }}</span>
        </RouterLink>
        <RouterLink
          @click="$emit('close-menu')"
          to="/about"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500 dark:hover:text-primary-400 transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>{{ t('header.about') }}</span>
        </RouterLink>
        <button
          v-if="isAuthenticated"
          @click="$emit('logout')"
          class="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{{ t('header.logout') }}</span>
        </button>
        <template v-else>
          <RouterLink
            @click="$emit('close-menu')"
            to="/login"
            class="px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-lg transition-all font-medium text-center"
          >
            {{ t('header.login') }}
          </RouterLink>
          <RouterLink
            @click="$emit('close-menu')"
            to="/register"
            class="px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg transition-all font-medium text-center"
          >
            {{ t('header.register') }}
          </RouterLink>
        </template>
      </nav>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  isOpen: boolean
  isAuthenticated: boolean
  isMobileVocabMenuOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close-menu'): void
  (e: 'close-menus'): void
  (e: 'toggle-vocab-menu'): void
  (e: 'logout'): void
}>()

const { t } = useI18n()
</script>
