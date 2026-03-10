<template>
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <!-- Animated icon -->
    <div class="relative mb-6">
      <div
        class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/15 to-secondary-500/15 dark:from-primary-500/20 dark:to-secondary-500/20 flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-primary-500"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          />
        </svg>
      </div>
      <!-- Plus indicator -->
      <div
        class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    </div>

    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
      {{ t("categories.noCategories") }}
    </h3>
    <p
      class="text-sm text-gray-500 dark:text-white/50 max-w-xs leading-relaxed"
    >
      {{ t("categories.addFirstCategory") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
