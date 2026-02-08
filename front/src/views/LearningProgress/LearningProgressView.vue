<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
        >
          {{ t("learningProgress.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("learningProgress.subtitle") }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-600"
          >
            ...
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="mx-auto"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p class="text-gray-600 dark:text-gray-400">{{ error }}</p>
        <button
          @click="loadProgress"
          class="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {{ t("common.retry") || "Thử lại" }}
        </button>
      </div>

      <!-- Content -->
      <template v-else-if="progress">
        <!-- Overview Stats -->
        <OverviewStats
          :total-words="progress.totalWords"
          :mastered-words="progress.masteredWords"
          :learning-words="progress.learningWords"
          :new-words="progress.newWords"
          :mastery-percentage="progress.masteryPercentage"
        />

        <!-- Rank Display -->
        <RankDisplay
          :rank="progress.rank"
          :rank-progress="progress.rankProgress"
          :total-score="progress.totalScore"
          :average-score="progress.averageScore"
        />

        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Streak Card -->
          <StreakCard :streak="progress.streak" />

          <!-- Weekly Progress -->
          <WeeklyProgressChart :weekly-progress="progress.weeklyProgress" />
        </div>

        <!-- Practice Stats -->
        <PracticeStatsCard :practice-stats="progress.practiceStats" />

        <!-- Achievements -->
        <AchievementsGrid :achievements="progress.achievements" />
      </template>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-illustration">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            class="text-gray-300 dark:text-gray-600"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
            />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <h3 class="empty-title">{{ t("learningProgress.empty.title") }}</h3>
        <p class="empty-description">
          {{ t("learningProgress.empty.description") }}
        </p>
        <RouterLink to="/vocabulary" class="empty-cta">
          {{ t("learningProgress.empty.startLearning") }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLearningProgressI18n } from "./composable/useLearningProgressI18n";
import { learningProgressService } from "./service/learningProgress.service";
import type { LearningProgressData } from "./interface/types";

// Initialize i18n
useLearningProgressI18n();
const { t } = useI18n();

// Components
const OverviewStats = defineAsyncComponent(
  () => import("./component/OverviewStats.vue") as any
);
const RankDisplay = defineAsyncComponent(
  () => import("./component/RankDisplay.vue") as any
);
const StreakCard = defineAsyncComponent(
  () => import("./component/StreakCard.vue") as any
);
const WeeklyProgressChart = defineAsyncComponent(
  () => import("./component/WeeklyProgressChart.vue") as any
);
const PracticeStatsCard = defineAsyncComponent(
  () => import("./component/PracticeStatsCard.vue") as any
);
const AchievementsGrid = defineAsyncComponent(
  () => import("./component/AchievementsGrid.vue") as any
);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const progress = ref<LearningProgressData | null>(null);

// Load progress data
const loadProgress = async () => {
  loading.value = true;
  error.value = null;

  try {
    progress.value = await learningProgressService.getProgress();
  } catch (err) {
    console.error("Failed to load learning progress:", err);
    error.value = "Không thể tải dữ liệu tiến độ học.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProgress();
});
</script>

<script lang="ts">
export default {
  name: "LearningProgressView",
};
</script>

<style scoped>
.empty-state {
  @apply text-center py-16;
}

.empty-illustration {
  @apply mb-6;
}

.empty-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.empty-description {
  @apply text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto;
}

.empty-cta {
  @apply inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-300;
}
</style>
