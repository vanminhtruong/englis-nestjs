<template>
  <section v-scroll-reveal class="mx-auto w-full max-w-4xl space-y-5">
    <button
      type="button"
      class="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
      @click="emit('back')"
    >
      <svg
        class="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      {{ t("practice.setupBack") }}
    </button>

    <div
      data-seasonal-card
      class="overflow-visible rounded-[28px] border border-gray-200 bg-white shadow-lg shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none sm:rounded-[32px]"
    >
      <header
        class="relative overflow-hidden rounded-t-[28px] border-b border-primary-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-5 py-7 dark:border-white/10 dark:from-gray-950 dark:via-black dark:to-gray-950 sm:rounded-t-[32px] sm:px-8 sm:py-9"
      >
        <div
          class="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-secondary-100/70 blur-3xl dark:bg-white/5"
          aria-hidden="true"
        ></div>
        <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-primary-100 bg-white text-3xl shadow-sm dark:border-white/10 dark:bg-white/10"
            aria-hidden="true"
          >
            {{ mode.icon }}
          </div>
          <div class="min-w-0">
            <p
              class="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-600 dark:text-gray-300"
            >
              {{ t("practice.setupEyebrow") }}
            </p>
            <h2
              class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
            >
              {{ t("practice.setupTitle") }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {{ t("practice.setupSubtitle") }}
            </p>
          </div>
        </div>
      </header>

      <div class="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <div
          class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-white/5 sm:p-5"
        >
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {{ t("practice.setupSelectedMode") }}
            </p>
            <p class="mt-1 text-base font-extrabold text-gray-900 dark:text-white">
              {{ t(modeNameKey) }}
            </p>
            <p class="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {{ t(modeDescriptionKey) }}
            </p>
          </div>
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-gray-200"
            aria-hidden="true"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-gray-200"
                aria-hidden="true"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  stroke-width="1.8"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M7 9h10M7 13h6" />
                </svg>
              </span>
              <div>
                <h3 class="text-base font-extrabold text-gray-900 dark:text-white sm:text-lg">
                  {{ t("practice.setupChooseTab") }}
                </h3>
                <p class="mt-1 max-w-xl text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {{ t("practice.setupChooseTabHint") }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
            >
              <TabIcon v-if="activeTabId" :icon="currentTab?.icon" size="xs" />
              <span
                v-else
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
                aria-hidden="true"
              ></span>
              <span class="truncate">{{ selectedTabName }}</span>
            </span>
          </div>

          <div
            class="rounded-2xl border border-gray-200 bg-white px-4 pt-4 dark:border-white/10 dark:bg-black sm:px-5"
          >
            <div
              v-if="loadingTabs"
              class="flex flex-wrap gap-2 pb-5"
              role="status"
              :aria-label="t('practice.setupLoadingTabs')"
            >
              <div
                v-for="n in 4"
                :key="n"
                class="h-9 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10"
              ></div>
            </div>
            <div
              v-else-if="tabsError"
              role="alert"
              class="flex flex-wrap items-center gap-3 pb-5 text-sm text-gray-600 dark:text-gray-300"
            >
              <span>{{ t("practice.setupLoadError") }}</span>
              <button
                type="button"
                class="rounded-xl bg-primary-50 px-3 py-2 font-bold text-primary-700 hover:bg-primary-100 dark:bg-white/10 dark:text-gray-200"
                @click="emit('retry-tabs')"
              >
                {{ t("practice.tryAgain") }}
              </button>
            </div>
            <VocabularyAppTabs
              v-else
              selection-only
              :tabs="tabs"
              :active-tab-id="activeTabId"
              :expand-label="t('practice.setupMoreTabs')"
              :collapse-label="t('practice.setupLessTabs')"
              @select="emit('select-tab', $event)"
            />
          </div>

          <p
            v-if="selectedCount !== null"
            class="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300"
          >
            <svg
              width="16"
              height="16"
              aria-hidden="true"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              stroke-width="2"
            >
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M9 8h6M9 12h6" />
            </svg>
            {{ t("practice.setupTabCount", { count: selectedCount }) }}
          </p>
          <p
            v-if="selectedCount === 0"
            class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            role="status"
          >
            {{ t("practice.setupEmptyTab") }}
          </p>
        </div>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6"
      >
        <p class="text-center text-xs leading-5 text-gray-500 dark:text-gray-400 sm:text-left">
          {{ t("practice.setupFooterHint") }}
        </p>
        <button
          type="button"
          :disabled="loading || loadingTabs || selectedCount === 0"
          class="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:from-primary-600 hover:to-secondary-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
          @click="emit('start')"
        >
          <span
            v-if="loading"
            class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          ></span>
          <svg
            v-else
            width="18"
            height="18"
            aria-hidden="true"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            stroke-width="2"
          >
            <path d="m8 5 11 7-11 7V5Z" />
          </svg>
          {{
            t(
              mode.key === "practice_by_date"
                ? "practice.setupChooseDate"
                : "practice.startPractice",
            )
          }}
        </button>
      </footer>
      <p
        v-if="errorMessage"
        class="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:mx-8"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import VocabularyAppTabs from "../../Vocabulary/component/VocabularyAppTabs.vue";
import TabIcon from "../../../components/common/TabIcon.vue";
import type { PracticeMode as PracticeModeItem } from "../service/practice.service";

interface PracticeTab {
  id: string;
  name: string;
  icon?: string | null;
  vocabularies?: { id: string }[];
}
const props = defineProps<{
  mode: PracticeModeItem;
  tabs: PracticeTab[];
  activeTabId: string | null;
  loadingTabs: boolean;
  tabsError: boolean;
  loading: boolean;
  errorMessage?: string;
}>();
const emit = defineEmits<{
  back: [];
  start: [];
  "select-tab": [id: string | null];
  "retry-tabs": [];
}>();
const { t } = useI18n();

const modeNames: Record<string, string> = {
  flashcard: "practice.flashcard",
  typing: "practice.typing",
  practice_by_date: "practice.practiceByDateMode",
  image_guess: "practice.imageGuess",
  ball_shooting: "practice.ballShooting",
  snake: "practice.snakeGame",
};
const modeDescriptions: Record<string, string> = {
  flashcard: "practice.modeDescriptions.flashcard",
  typing: "practice.modeDescriptions.typing",
  practice_by_date: "practice.modeDescriptions.practiceByDate",
  image_guess: "practice.modeDescriptions.imageGuess",
  ball_shooting: "practice.modeDescriptions.ballShooting",
  snake: "practice.modeDescriptions.snakeGame",
};
const modeNameKey = computed(() => modeNames[props.mode.key] || "practice.modes");
const modeDescriptionKey = computed(
  () => modeDescriptions[props.mode.key] || "practice.modesSubtitle",
);
const currentTab = computed(() => props.tabs.find((tab) => tab.id === props.activeTabId));
const selectedTabName = computed(() => currentTab.value?.name ?? t("practice.setupAllTabs"));
const selectedCount = computed(() => {
  if (!props.activeTabId || !currentTab.value?.vocabularies) return null;
  return currentTab.value.vocabularies.length;
});
</script>
