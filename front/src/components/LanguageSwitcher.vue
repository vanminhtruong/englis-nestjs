<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
    >
      <span
        class="inline-flex h-5 w-7 items-center justify-center overflow-hidden rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40"
      >
        <span v-if="currentFlagClass" :class="['fi', currentFlagClass.split(' ').filter(c => c !== 'fi')]" class="fi"></span>
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-600 dark:text-primary-400">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-white/5 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
      >
        <button
          v-for="lang in availableLocales"
          :key="lang.code"
          @click="selectLanguage(lang.code)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-primary-900/20 transition-all text-left',
            locale === lang.code && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
          ]"
        >
          <span
            class="inline-flex h-5 w-7 items-center justify-center overflow-hidden rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40"
          >
            <span :class="['fi', ...(lang.flagClass?.split(' ') || []).filter(c => c !== 'fi')]" class="fi"></span>
          </span>
          <span class="font-medium">{{ lang.name }}</span>
          <svg
            v-if="locale === lang.code"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="ml-auto"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { locale, availableLocales, setLocale } = useLanguage()
const isOpen = ref(false)

const currentFlagClass = computed(() => {
  const current = availableLocales.find((l) => l.code === locale.value)
  return current?.flagClass ?? 'fi fi-vn'
})

function selectLanguage(code: string) {
  setLocale(code)
  isOpen.value = false
}
</script>
