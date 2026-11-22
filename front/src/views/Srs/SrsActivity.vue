<template>
  <section
    class="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none"
    :aria-label="t('srs.activityLabel')"
  >
    <!-- Header -->
    <header
      class="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-5 pb-5 pt-6 dark:border-white/10 dark:from-gray-950 dark:via-black dark:to-gray-950"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-secondary-200/30 blur-3xl dark:bg-white/5"
      ></div>
      <div class="relative flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5">
          <span
            class="h-1.5 w-7 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
            aria-hidden="true"
          ></span>
          <p
            class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary-600 dark:text-gray-400"
          >
            {{ t("srs.activityLabel") }}
          </p>
        </div>
        <span
          class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-white/90 px-2.5 py-1 text-[11px] font-bold leading-4 text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
        >
          <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-60"
            ></span>
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-500"></span>
          </span>
          {{ t("srs.activityLive") }}
        </span>
      </div>
      <h2 class="relative mt-3 text-xl font-extrabold leading-snug tracking-tight">
        {{ t("srs.activityHeading") }}
      </h2>
      <p class="relative mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
        {{ t("srs.activityDescription") }}
      </p>

      <!-- Segmented switch -->
      <div
        class="relative mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-gray-100 p-1 dark:bg-white/10"
        role="tablist"
        :aria-label="t('srs.activityLabel')"
      >
        <button
          v-for="tab in views"
          :key="tab.id"
          :id="'srs-activity-tab-' + tab.id"
          type="button"
          role="tab"
          :aria-selected="view === tab.id"
          :aria-controls="'srs-activity-panel-' + tab.id"
          class="flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 sm:gap-2 sm:px-3 sm:text-sm"
          :class="
            view === tab.id
              ? 'bg-white text-primary-700 shadow-sm dark:bg-black dark:text-white'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          "
          @click="view = tab.id"
        >
          <span class="min-w-0 break-words text-center">{{ t(tab.title) }}</span>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums"
            :class="
              view === tab.id
                ? tab.id === 'upcoming'
                  ? 'bg-primary-50 text-primary-700 dark:bg-white/10 dark:text-gray-200'
                  : 'bg-secondary-50 text-secondary-700 dark:bg-white/10 dark:text-gray-200'
                : 'bg-white/70 text-gray-500 dark:bg-white/5 dark:text-gray-400'
            "
            >{{ tab.id === "upcoming" ? (upcoming?.meta.total ?? 0) : (history?.meta.total ?? 0) }}</span
          >
        </button>
      </div>
    </header>

    <!-- Upcoming panel -->
    <div
      v-show="view === 'upcoming'"
      id="srs-activity-panel-upcoming"
      role="tabpanel"
      aria-labelledby="srs-activity-tab-upcoming"
      class="flex flex-1 flex-col"
    >
      <p class="px-5 pt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
        {{ t("srs.upcomingHint") }}
      </p>
      <div class="min-h-[220px] flex-1 sm:min-h-[260px] xl:min-h-[320px]" aria-live="polite">
        <div
          v-if="upcomingLoading"
          class="space-y-2 p-4"
          role="status"
          :aria-label="t('srs.loading')"
        >
          <div
            v-for="n in PAGE_SIZE"
            :key="n"
            class="h-[60px] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/10"
          ></div>
        </div>
        <div
          v-else-if="upcomingError"
          role="alert"
          class="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-[260px] xl:min-h-[320px]"
        >
          <p class="text-sm text-red-600 dark:text-red-300">{{ t("srs.activityError") }}</p>
          <button
            type="button"
            class="rounded-xl bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100 dark:bg-white/10 dark:text-gray-200"
            @click="loadUpcoming(upcoming?.meta.page ?? 1)"
          >
            {{ t("srs.retry") }}
          </button>
        </div>
        <ul v-else-if="upcoming?.data.length" class="space-y-2 p-4">
          <li
            v-for="item in upcoming.data"
            :key="item.vocabularyId"
            class="flex min-w-0 items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50/60 px-2.5 py-2.5 transition-colors hover:border-primary-200 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:gap-3 sm:px-3"
          >
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-primary-700 shadow-sm ring-1 ring-primary-100 dark:bg-white/10 dark:text-gray-200 dark:ring-white/10"
              aria-hidden="true"
            >
              {{ item.word.trim().charAt(0).toUpperCase() || "?" }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex min-w-0 items-center justify-between gap-2">
                <p
                  class="truncate text-sm font-bold text-gray-900 dark:text-white"
                  :title="item.word"
                >
                  {{ item.word }}
                </p>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="
                    item.isDue
                      ? 'bg-primary-100 text-primary-700 dark:bg-white/10 dark:text-gray-200'
                      : 'bg-white text-gray-500 ring-1 ring-gray-200 dark:bg-transparent dark:text-gray-400 dark:ring-white/10'
                  "
                  >{{ t(item.isDue ? "srs.upcomingDue" : "srs.upcomingScheduled") }}</span
                >
              </div>
              <p
                class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400"
                :title="item.meaning"
              >
                {{ item.meaning }}
              </p>
              <time
                class="mt-0.5 block text-[11px] font-semibold tabular-nums text-gray-700 dark:text-gray-300"
                :datetime="item.nextReviewAt"
                >{{ formatDate(item.nextReviewAt) }}</time
              >
            </div>
          </li>
        </ul>
        <div
          v-else
          class="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:min-h-[260px] xl:min-h-[320px]"
        >
          <span
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-white/5 dark:text-gray-200"
            aria-hidden="true"
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 3 3 5-6" />
            </svg>
          </span>
          <p class="max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
            {{ t("srs.upcomingEmpty") }}
          </p>
        </div>
      </div>
      <footer
        v-if="upcoming?.meta?.pageCount && upcoming.meta.pageCount > 1 && !upcomingError"
        class="srs-pagination border-t border-gray-100 px-2 pb-5 pt-1 dark:border-white/10"
      >
        <Pagination
          :page="upcoming.meta.page"
          :page-count="upcoming.meta.pageCount"
          @page-change="loadUpcoming"
        />
        <p class="mt-3 text-center text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {{
            t("srs.paginationShowing", {
              from: (upcoming.meta.page - 1) * upcoming.meta.limit + 1,
              to: Math.min(upcoming.meta.total, upcoming.meta.page * upcoming.meta.limit),
              total: upcoming.meta.total,
            })
          }}
        </p>
      </footer>
    </div>

    <!-- History panel: timeline -->
    <div
      v-show="view === 'history'"
      id="srs-activity-panel-history"
      role="tabpanel"
      aria-labelledby="srs-activity-tab-history"
      class="flex flex-1 flex-col"
    >
      <p class="px-5 pt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
        {{ t("srs.historyHint") }}
      </p>
      <div class="min-h-[220px] flex-1 sm:min-h-[260px] xl:min-h-[320px]" aria-live="polite">
        <div
          v-if="historyLoading"
          class="space-y-2 p-4"
          role="status"
          :aria-label="t('srs.loading')"
        >
          <div
            v-for="n in PAGE_SIZE"
            :key="n"
            class="h-[60px] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/10"
          ></div>
        </div>
        <div
          v-else-if="historyError"
          role="alert"
          class="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-[260px] xl:min-h-[320px]"
        >
          <p class="text-sm text-red-600 dark:text-red-300">{{ t("srs.activityError") }}</p>
          <button
            type="button"
            class="rounded-xl bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100 dark:bg-white/10 dark:text-gray-200"
            @click="loadHistory(history?.meta.page ?? 1)"
          >
            {{ t("srs.retry") }}
          </button>
        </div>
        <ol
          v-else-if="history?.data.length"
          class="relative px-5 py-3 before:absolute before:bottom-8 before:left-[39px] before:top-8 before:w-px before:bg-gray-200 dark:before:bg-white/10"
        >
          <li
            v-for="item in history.data"
            :key="item.id"
            class="relative flex min-w-0 items-center gap-3 py-2.5"
          >
            <span
              class="relative h-10 w-10 shrink-0 rounded-full bg-white p-1 dark:bg-black"
              aria-hidden="true"
            >
              <span
                class="flex h-full w-full items-center justify-center rounded-full"
                :class="ratingDot(item.rating)"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
            </span>
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-bold text-gray-900 dark:text-white"
                :title="item.word"
              >
                {{ item.word }}
              </p>
              <time
                class="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400"
                :datetime="item.reviewedAt"
                >{{ formatDate(item.reviewedAt) }}</time
              >
            </div>
            <span
              class="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
              :class="ratingStyle(item.rating)"
              >{{ t("srs." + item.rating) }}</span
            >
          </li>
        </ol>
        <div
          v-else
          class="flex min-h-[220px] flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:min-h-[260px] xl:min-h-[320px]"
        >
          <span
            class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-200"
            aria-hidden="true"
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l4 2" />
            </svg>
          </span>
          <p class="max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
            {{ t("srs.historyEmpty") }}
          </p>
        </div>
      </div>
      <footer
        v-if="history?.meta?.pageCount && history.meta.pageCount > 1 && !historyError"
        class="srs-pagination border-t border-gray-100 px-2 pb-5 pt-1 dark:border-white/10"
      >
        <Pagination
          :page="history.meta.page"
          :page-count="history.meta.pageCount"
          @page-change="loadHistory"
        />
        <p class="mt-3 text-center text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {{
            t("srs.paginationShowing", {
              from: (history.meta.page - 1) * history.meta.limit + 1,
              to: Math.min(history.meta.total, history.meta.page * history.meta.limit),
              total: history.meta.total,
            })
          }}
        </p>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Pagination from "../../components/Pagination.vue";
import { apiClient } from "../../services/api.service";
import type { SrsHistory, SrsPage, SrsRating, SrsUpcoming } from "./types";

const props = defineProps<{ tabId?: string | null }>();
const PAGE_SIZE = 6;
const view = ref<"upcoming" | "history">("upcoming");
const views = [
  { id: "upcoming" as const, title: "srs.upcomingTitle" },
  { id: "history" as const, title: "srs.historyTitle" },
];
const { t, locale } = useI18n();
const upcoming = ref<SrsPage<SrsUpcoming> | null>(null);
const history = ref<SrsPage<SrsHistory> | null>(null);
const upcomingLoading = ref(true);
const historyLoading = ref(true);
const upcomingError = ref(false);
const historyError = ref(false);
let upcomingRequest = 0;
let historyRequest = 0;

async function loadUpcoming(page = 1) {
  if (upcomingLoading.value && upcoming.value) return;
  const request = ++upcomingRequest;
  upcomingLoading.value = true;
  upcomingError.value = false;
  try {
    const { data } = await apiClient.get<SrsPage<SrsUpcoming>>("/srs/upcoming", {
      params: { page, limit: PAGE_SIZE, tabId: props.tabId ?? undefined },
    });
    if (request === upcomingRequest) upcoming.value = data;
  } catch {
    if (request === upcomingRequest) upcomingError.value = true;
  } finally {
    if (request === upcomingRequest) upcomingLoading.value = false;
  }
}

async function loadHistory(page = 1) {
  if (historyLoading.value && history.value) return;
  const request = ++historyRequest;
  historyLoading.value = true;
  historyError.value = false;
  try {
    const { data } = await apiClient.get<SrsPage<SrsHistory>>("/srs/history", {
      params: { page, limit: PAGE_SIZE, tabId: props.tabId ?? undefined },
    });
    if (request === historyRequest) history.value = data;
  } catch {
    if (request === historyRequest) historyError.value = true;
  } finally {
    if (request === historyRequest) historyLoading.value = false;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const language =
    locale.value === "vi"
      ? "vi-VN"
      : locale.value === "ko"
        ? "ko-KR"
        : locale.value === "zh-CN"
          ? "zh-CN"
          : "en-US";
  return new Intl.DateTimeFormat(language, { dateStyle: "short", timeStyle: "short" }).format(date);
}

const ratingStyles: Record<SrsRating, string> = {
  again:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300",
  hard: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300",
  good: "border-primary-200 bg-primary-50 text-primary-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200",
  easy: "border-secondary-200 bg-secondary-50 text-secondary-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200",
};
const ratingDots: Record<SrsRating, string> = {
  again: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  hard: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
  good: "bg-primary-100 text-primary-600 dark:bg-white/10 dark:text-gray-200",
  easy: "bg-secondary-100 text-secondary-600 dark:bg-white/10 dark:text-gray-200",
};
function ratingDot(rating: SrsRating) {
  return ratingDots[rating];
}
function ratingStyle(rating: SrsRating) {
  return ratingStyles[rating];
}

onMounted(() => {
  void loadUpcoming();
  void loadHistory();
});
onBeforeUnmount(() => {
  upcomingRequest++;
  historyRequest++;
});
</script>
<style scoped>
/* Only adjust the project's shared Pagination within compact SRS cards. */
.srs-pagination :deep(nav) {
  max-width: 100%;
}
.srs-pagination :deep(> div) {
  margin-top: 1rem;
}
@media (max-width: 479px) {
  .srs-pagination :deep(nav) {
    gap: 0.25rem;
    padding: 0.25rem;
  }
  .srs-pagination :deep(nav > button),
  .srs-pagination :deep(nav > div > button) {
    width: 2rem;
    height: 2rem;
  }
  .srs-pagination :deep(nav > div) {
    gap: 0.25rem;
  }
}
</style>
