<template>
  <div class="min-h-screen min-w-0 bg-white py-10 dark:bg-black sm:py-16 lg:py-20">
    <div class="mx-auto w-full max-w-[1400px] min-w-0 px-3 sm:px-6 lg:px-8">
      <div class="mb-8 text-center sm:mb-12 lg:mb-16">
        <h1 class="mb-4 break-words text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:mb-6 sm:text-3xl sm:text-4xl lg:text-5xl">
          {{ t("about.title") }}
        </h1>
        <p class="mx-auto max-w-3xl break-words text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg lg:text-xl">
          {{ t("about.subtitle") }}
        </p>
      </div>

      <div class="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        <div class="min-w-0 rounded-2xl bg-gray-50 p-5 dark:bg-white/5 sm:p-7 lg:p-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              ></path>
            </svg>
          </div>
          <h3 class="mb-3 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {{ t("about.missionTitle") }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("about.missionText") }}
          </p>
        </div>

        <div class="min-w-0 rounded-2xl bg-gray-50 p-5 dark:bg-white/5 sm:p-7 lg:p-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 class="mb-3 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {{ t("about.communityTitle") }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("about.communityText") }}
          </p>
        </div>

        <div class="min-w-0 rounded-2xl bg-gray-50 p-5 dark:bg-white/5 sm:p-7 lg:p-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h3 class="mb-3 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {{ t("about.technologyTitle") }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t("about.technologyText") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<script lang="ts">
export default {
  name: "AboutView",
};
</script>
