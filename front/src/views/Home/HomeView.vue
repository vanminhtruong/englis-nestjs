<template>
  <div class="min-h-screen bg-white dark:bg-black">
    <!-- Hero Section -->
    <section
      class="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      <!-- Background Gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-black dark:via-black dark:to-black z-0"
      ></div>

      <!-- Animated Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute top-20 left-20 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute bottom-20 right-20 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-pulse delay-1000"
        ></div>
        <div
          class="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-300/10 rounded-full blur-2xl animate-pulse delay-500"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 max-w-[1400px] mx-auto px-8 py-16">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div class="text-center lg:text-left">
            <h1
              class="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              <span class="block min-h-[1.2em]">
                {{ displayedPrefix
                }}<span
                  v-if="typingPhase === 'prefix'"
                  class="animate-pulse inline-block align-middle h-[0.8em] w-[2px] bg-current ml-1"
                ></span>
              </span>
              <span class="block min-h-[1.2em]">
                <span
                  class="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
                  >{{ displayedBrand }}</span
                ><span
                  v-if="typingPhase !== 'prefix'"
                  class="animate-pulse inline-block align-middle h-[0.8em] w-[2px] bg-primary-500 ml-1"
                ></span>
              </span>
            </h1>
            <p
              class="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              {{ t("home.heroSubtitle") }}
            </p>
            <div
              class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <RouterLink
                to="/practice"
                class="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{{ t("home.heroPrimaryCta") }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </RouterLink>
              <RouterLink
                to="/about"
                class="px-8 py-4 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{{ t("home.heroSecondaryCta") }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </RouterLink>
            </div>
          </div>

          <!-- Hero Image -->
          <div class="relative">
            <div class="relative w-full max-w-md mx-auto lg:max-w-none">
              <!-- Main Game Card -->
              <div
                class="relative bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-1 shadow-2xl transform hover:scale-105 transition-transform duration-300"
              >
                <div class="bg-white dark:bg-black rounded-3xl p-8">
                  <div
                    class="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1"
                      class="text-primary-500 dark:text-primary-400"
                    >
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                      ></path>
                      <polyline
                        points="3.27 6.96 12 12.01 20.73 6.96"
                      ></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3
                    class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2"
                  >
                    {{ t("home.featureRichCollectionsTitle") }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ t("home.featureRichCollectionsText") }}
                  </p>
                </div>
              </div>

              <!-- Floating Cards -->
              <div
                class="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl transform rotate-12 hover:rotate-6 transition-transform duration-300"
              ></div>
              <div
                class="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl shadow-xl transform -rotate-12 hover:-rotate-6 transition-transform duration-300"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-white dark:bg-black">
      <div class="max-w-[1400px] mx-auto px-8">
        <div class="text-center mb-16">
          <h2
            class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {{ t("home.featuresTitle") }}
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ t("home.featuresSubtitle") }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featureRichCollectionsTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featureRichCollectionsText") }}
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featurePersonalizedTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featurePersonalizedText") }}
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featureLearnAnywhereTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featureLearnAnywhereText") }}
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-4"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featureProgressTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featureProgressText") }}
            </p>
          </div>

          <!-- Feature 5 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featureUpToDateTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featureUpToDateText") }}
            </p>
          </div>

          <!-- Feature 6 -->
          <div
            class="group p-8 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-primary-50 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10"
          >
            <div
              class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform"
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
                <path d="M9 11l3 3L22 4"></path>
                <path
                  d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                ></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t("home.featureSafePrivateTitle") }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ t("home.featureSafePrivateText") }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section
      class="py-20 bg-gradient-to-br from-gray-900 to-black dark:from-black dark:to-black text-white"
    >
      <div class="max-w-[1400px] mx-auto px-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div class="group">
            <div
              class="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform"
            >
              10k+
            </div>
            <p class="text-gray-400 dark:text-gray-500 text-lg">
              {{ t("home.statsWordsLearned") }}
            </p>
          </div>
          <div class="group">
            <div
              class="text-5xl font-bold bg-gradient-to-r from-secondary-400 to-secondary-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform"
            >
              500+
            </div>
            <p class="text-gray-400 dark:text-gray-500 text-lg">
              {{ t("home.statsVocabularySets") }}
            </p>
          </div>
          <div class="group">
            <div
              class="text-5xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform"
            >
              3+
            </div>
            <p class="text-gray-400 dark:text-gray-500 text-lg">
              {{ t("home.statsLanguagesSupported") }}
            </p>
          </div>
          <div class="group">
            <div
              class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform"
            >
              30 min
            </div>
            <p class="text-gray-400 dark:text-gray-500 text-lg">
              {{ t("home.statsAverageDailyPractice") }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const { t, locale } = useI18n();

const displayedPrefix = ref("");
const displayedBrand = ref("");
const typingPhase = ref<"prefix" | "brand" | "done">("prefix");
let isComponentMounted = false;
let currentLoopId = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const typeText = async () => {
  const myLoopId = ++currentLoopId;

  while (isComponentMounted && myLoopId === currentLoopId) {
    const prefix = t("home.heroTitlePrefix");
    const brand = t("home.heroTitleBrand");

    // Reset
    displayedPrefix.value = "";
    displayedBrand.value = "";
    typingPhase.value = "prefix";

    // Type prefix
    for (const char of prefix) {
      if (!isComponentMounted || myLoopId !== currentLoopId) return;
      displayedPrefix.value += char;
      await sleep(50 + Math.random() * 30);
    }

    typingPhase.value = "brand";

    // Type brand
    for (const char of brand) {
      if (!isComponentMounted || myLoopId !== currentLoopId) return;
      displayedBrand.value += char;
      await sleep(50 + Math.random() * 30);
    }

    typingPhase.value = "done";

    // Wait 1.2s before deleting
    await sleep(1200);

    if (!isComponentMounted || myLoopId !== currentLoopId) return;

    // Delete Brand
    typingPhase.value = "brand";
    while (displayedBrand.value.length > 0) {
      if (!isComponentMounted || myLoopId !== currentLoopId) return;
      displayedBrand.value = displayedBrand.value.slice(0, -1);
      await sleep(30);
    }

    // Delete Prefix
    typingPhase.value = "prefix";
    while (displayedPrefix.value.length > 0) {
      if (!isComponentMounted || myLoopId !== currentLoopId) return;
      displayedPrefix.value = displayedPrefix.value.slice(0, -1);
      await sleep(30);
    }

    await sleep(500);
  }
};

watch(locale, () => {
  typeText();
});

onMounted(() => {
  isComponentMounted = true;
  typeText();
});

onBeforeUnmount(() => {
  isComponentMounted = false;
});
</script>

<script lang="ts">
export default {
  name: "HomeView",
};
</script>
