<template>
  <div class="flex items-center gap-2">
    <LanguageSwitcher class="hidden md:block" />

    <button
      @click="$emit('toggle-theme')"
      class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
    >
      <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>

    <template v-if="isAuthenticated">
      <div class="hidden md:block relative z-[70]">
        <button
          @click="$emit('toggle-user-menu')"
          class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          <img
            :src="userAvatarSrc"
            alt="Avatar"
            class="w-8 h-8 rounded-full border-2 border-primary-500 cursor-pointer hover:border-primary-600 transition-all"
            @click.stop="openAvatarZoom"
          />
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-white text-sm">{{ userInitials }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ userWordsCount }} {{ t('header.words') }}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-500">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AvatarZoomModal
          :visible="isAvatarZoomVisible"
          :src="userAvatarSrc"
          @close="closeAvatarZoom"
        />

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white dark:bg-black backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-[80]"
          >
            <div class="p-2">
              <RouterLink
                @click="$emit('close-user-menu')"
                to="/profile"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
                </svg>
                <span class="font-medium">{{ t('header.profile') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-user-menu')"
                to="/voice-settings"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 3v18" />
                  <path d="M19 3v18" />
                  <rect x="8" y="5" width="8" height="4" rx="1" />
                  <rect x="8" y="11" width="8" height="4" rx="1" />
                  <rect x="8" y="17" width="3" height="4" rx="1" />
                </svg>
                <span class="font-medium">{{ t('header.voiceSettings') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-user-menu')"
                to="/favorites"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span class="font-medium">{{ t('header.favorites') }}</span>
              </RouterLink>
              <RouterLink
                @click="$emit('close-user-menu')"
                to="/history"
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-white/10 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <span class="font-medium">{{ t('header.history') }}</span>
              </RouterLink>
              <button
                @click="$emit('logout')"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span class="font-medium">{{ t('header.logout') }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </template>
    <template v-else>
      <RouterLink
        to="/login"
        class="hidden md:flex px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-all font-medium"
      >
        {{ t('header.login') }}
      </RouterLink>
      <RouterLink
        to="/register"
        class="hidden md:flex px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
      >
        {{ t('header.register') }}
      </RouterLink>
    </template>

    <button
      v-if="isAuthenticated"
      @click="$emit('toggle-mobile-account-menu')"
      class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
    >
      <img
        :src="userAvatarSrc"
        alt="Avatar"
        class="w-9 h-9 rounded-full border border-primary-500 cursor-pointer hover:border-primary-600 transition-all"
        @click.stop="openAvatarZoom"
      />
    </button>
    <button
      @click="$emit('toggle-mobile-menu')"
      class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
    >
      <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const LanguageSwitcher = defineAsyncComponent(() => import('../../LanguageSwitcher.vue') as any)
const AvatarZoomModal = defineAsyncComponent(() => import('../../common/AvatarZoomModal.vue') as any)

const props = defineProps<{
  isDark: boolean
  isAuthenticated: boolean
  isUserMenuOpen: boolean
  isMobileMenuOpen: boolean
  userAvatarSrc: string
  userInitials: string
  userWordsCount: number
}>()

const emit = defineEmits<{
  (e: 'toggle-theme'): void
  (e: 'toggle-user-menu'): void
  (e: 'close-user-menu'): void
  (e: 'logout'): void
  (e: 'toggle-mobile-menu'): void
  (e: 'toggle-mobile-account-menu'): void
}>()

const { t } = useI18n()

const isAvatarZoomVisible = ref(false)

const openAvatarZoom = () => {
  isAvatarZoomVisible.value = true
}

const closeAvatarZoom = () => {
  isAvatarZoomVisible.value = false
}
</script>
