<template>
  <main
    class="min-h-screen min-w-0 bg-gradient-to-b from-primary-50/70 via-white to-white px-3 py-5 text-gray-900 transition-colors dark:from-black dark:via-black dark:to-black dark:text-white sm:px-5 sm:py-7 lg:px-6 lg:py-9"
  >
    <div class="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6">
      <!-- Hero: compact page header, same palette and dark-mode strategy as VocabMaster. -->
      <section
        class="relative isolate overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-xl shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute -right-28 -top-36 h-80 w-80 rounded-full bg-primary-200/50 blur-3xl dark:bg-white/10"
        ></div>
        <div
          aria-hidden="true"
          class="pointer-events-none absolute -bottom-40 right-1/4 h-72 w-72 rounded-full bg-secondary-100/80 blur-3xl dark:bg-white/5"
        ></div>
        <div
          class="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:py-9"
        >
          <div class="min-w-0 max-w-2xl">
            <div
              class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-xs font-bold tracking-widest text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
            >
              <span aria-hidden="true" class="h-2 w-2 rounded-full bg-primary-500"></span>
              {{ t("srs.eyebrow") }}
            </div>
            <h1 class="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              <span
                class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300"
                >{{ t("srs.title") }}</span
              >
            </h1>
            <p
              class="mt-3 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base"
            >
              {{ t("srs.subtitle") }}
            </p>
            <p
              v-if="overview?.nextReviewAt"
              class="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3.5 py-1.5 text-xs text-gray-500 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
                class="shrink-0 text-primary-600 dark:text-gray-200"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span class="truncate">
                {{ t("srs.next") }}:
                <strong class="font-semibold text-gray-700 dark:text-gray-200">{{
                  formatNext(overview.nextReviewAt)
                }}</strong>
              </span>
            </p>
          </div>
          <div
            aria-hidden="true"
            class="hidden h-28 w-28 shrink-0 place-items-center rounded-3xl border border-primary-200/70 bg-gradient-to-br from-primary-50 to-secondary-50 shadow-inner dark:border-white/10 dark:from-gray-950 dark:to-gray-900 lg:grid"
          >
            <svg width="76" height="76" viewBox="0 0 96 96" fill="none">
              <rect
                x="19"
                y="16"
                width="58"
                height="64"
                rx="12"
                class="fill-white dark:fill-gray-900"
                stroke="#667eea"
                stroke-width="3"
              />
              <path
                d="M33 36h30M33 48h21M33 60h16"
                stroke="#a855f7"
                stroke-width="4"
                stroke-linecap="round"
              />
              <path
                d="m61 60 7 7 13-15"
                stroke="#667eea"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      <!-- Overview: main column + sticky activity sidebar -->
      <template v-if="phase === 'overview'">
        <div class="grid min-w-0 items-start gap-4 sm:gap-6 xl:grid-cols-12">
          <div class="min-w-0 space-y-4 sm:space-y-6 xl:col-span-8">
            <!-- Reuse the vocabulary module's tab selector in selection-only mode. -->
            <section
              class="min-w-0 rounded-3xl border border-gray-200 bg-white px-4 pb-3 pt-5 shadow-sm dark:border-white/10 dark:bg-black sm:px-7 sm:pt-6"
              :aria-label="t('srs.tabSelection')"
            >
              <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div class="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-white/10 dark:text-gray-200"
                    aria-hidden="true"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="1.8"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 9h10M7 13h6" />
                    </svg>
                  </span>
                  <div class="min-w-0">
                    <h2
                      class="break-words text-base font-extrabold leading-snug text-gray-900 dark:text-white sm:text-lg"
                    >
                      {{ t("srs.tabSelection") }}
                    </h2>
                    <p class="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {{ t("srs.tabHint") }}
                    </p>
                  </div>
                </div>
                <span
                  class="inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border border-primary-100 bg-primary-50 py-1 pl-1.5 pr-3 text-xs font-bold text-primary-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
                >
                  <TabIcon v-if="selectedTabId" :icon="selectedTabIcon" size="xs" />
                  <span class="max-w-44 truncate">{{ selectedTabName }}</span>
                </span>
              </div>
              <div v-if="tabsLoading" class="flex flex-wrap gap-2 pb-5" aria-busy="true">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-9 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10"
                ></div>
              </div>
              <div
                v-else-if="tabsError"
                class="flex flex-wrap items-center gap-3 pb-5 text-sm text-red-600 dark:text-red-300"
              >
                <span>{{ t("srs.tabLoadError") }}</span>
                <button
                  type="button"
                  class="rounded-lg bg-primary-50 px-3 py-1.5 font-semibold text-primary-700 dark:bg-white/10 dark:text-gray-200"
                  @click="initializeTabs"
                >
                  {{ t("srs.retry") }}
                </button>
              </div>
              <VocabularyAppTabs
                v-else
                :tabs="vocabularyTabs"
                :active-tab-id="selectedTabId"
                selection-only
                :expand-label="t('srs.tabExpand')"
                :collapse-label="t('srs.tabCollapse')"
                @select="selectTab"
              />
            </section>

            <div
              v-if="error === 'overview'"
              role="alert"
              class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
            >
              {{ t("srs.error") }}
              <button
                class="ml-2 font-bold underline underline-offset-2"
                type="button"
                @click="refreshOverview()"
              >
                {{ t("srs.retry") }}
              </button>
            </div>

            <!-- Study panel (primary action) -->
            <section
              class="overflow-visible rounded-3xl border border-primary-100 bg-white shadow-lg shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none"
            >
              <div
                class="relative overflow-hidden rounded-t-3xl border-b border-gray-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-6 py-7 dark:border-white/10 dark:from-gray-950 dark:via-black dark:to-gray-950 sm:px-8 sm:py-8"
              >
                <div
                  aria-hidden="true"
                  class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-secondary-200/30 blur-3xl dark:bg-white/5"
                ></div>
                <div class="relative flex items-center justify-between gap-3">
                  <h2
                    class="text-sm font-extrabold uppercase tracking-widest text-primary-700 dark:text-gray-200"
                  >
                    {{ t("srs.today") }}
                  </h2>
                  <span
                    class="rounded-full border border-primary-200 bg-white/90 px-3 py-1 text-xs font-bold text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  >
                    {{ t("srs.available") }}
                  </span>
                </div>
                <div class="relative mt-4 flex flex-wrap items-end justify-between gap-x-5 gap-y-5">
                  <p
                    class="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-6xl font-extrabold leading-none tabular-nums text-transparent dark:from-gray-100 dark:to-gray-300 sm:text-7xl"
                  >
                    {{ overview?.availableWords ?? 0 }}
                  </p>
                  <div
                    class="grid min-w-0 w-full flex-1 grid-cols-3 gap-2 sm:min-w-[230px] sm:max-w-md sm:gap-2.5"
                  >
                    <div class="rounded-2xl bg-primary-50 px-2 py-3 text-center dark:bg-white/5">
                      <p
                        class="text-xl font-extrabold tabular-nums text-primary-600 dark:text-gray-200"
                      >
                        {{ overview?.dueWords ?? 0 }}
                      </p>
                      <p class="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                        {{ t("srs.due") }}
                      </p>
                    </div>
                    <div class="rounded-2xl bg-secondary-50 px-2 py-3 text-center dark:bg-white/5">
                      <p
                        class="text-xl font-extrabold tabular-nums text-secondary-600 dark:text-gray-200"
                      >
                        {{ overview?.newWords ?? 0 }}
                      </p>
                      <p class="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                        {{ t("srs.new") }}
                      </p>
                    </div>
                    <div class="rounded-2xl bg-gray-100 px-2 py-3 text-center dark:bg-white/5">
                      <p class="text-xl font-extrabold tabular-nums">
                        {{ overview?.reviewed24h ?? 0 }}
                      </p>
                      <p class="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                        {{ t("srs.reviewed") }}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  v-if="dueNewTotal > 0"
                  class="relative mt-5 flex h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-white/10"
                  aria-hidden="true"
                >
                  <div
                    class="h-full bg-primary-500 transition-all duration-500"
                    :style="{ width: duePercent + '%' }"
                  ></div>
                  <div class="h-full flex-1 bg-secondary-500"></div>
                </div>
              </div>

              <div class="space-y-4 p-4 sm:px-6 sm:py-6 lg:px-8">
                <div class="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-end">
                  <SrsSessionSizeSelect v-model="sessionSize" />
                  <button
                    type="button"
                    :disabled="overviewLoading || !overview?.totalWords"
                    class="flex h-[72px] min-w-0 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 text-center text-sm font-bold leading-snug text-white shadow-lg shadow-primary-500/20 transition hover:from-primary-600 hover:to-secondary-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:px-5 sm:text-base"
                    @click="start(sessionSize, shouldPracticeScheduled || sessionIncludesScheduled)"
                  >
                    <span class="shrink-0" aria-hidden="true">✦</span
                    ><span class="min-w-0">{{
                      t(shouldPracticeScheduled ? "srs.practiceStart" : "srs.start")
                    }}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
                <p
                  v-if="!overviewLoading && !overview?.totalWords"
                  class="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {{ t("srs.empty") }}
                </p>
                <p
                  v-else-if="!overviewLoading && shouldPracticeScheduled"
                  class="text-center text-sm leading-6 text-gray-500 dark:text-gray-400"
                >
                  {{ t("srs.practiceAvailable") }}
                </p>
                <RouterLink
                  to="/vocabulary"
                  class="block text-center text-sm font-semibold text-primary-600 hover:underline dark:text-gray-200"
                  >{{ t("srs.viewWords") }}</RouterLink
                >
              </div>
            </section>

            <!-- Statistics -->
            <section aria-label="Statistics" class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
              <div
                v-for="stat in stats"
                :key="stat.key"
                class="min-w-0 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-white/10 dark:bg-black sm:p-5"
              >
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl"
                  :class="stat.bg"
                >
                  <span aria-hidden="true" class="text-lg">{{ stat.icon }}</span>
                </span>
                <p class="mt-4 text-3xl font-extrabold leading-none tabular-nums">
                  {{ overview?.[stat.key] ?? "—" }}
                </p>
                <p
                  class="mt-2 break-words text-xs font-medium leading-snug text-gray-500 dark:text-gray-400 sm:text-sm"
                >
                  {{ t(stat.label) }}
                </p>
              </div>
            </section>

            <!-- How it works -->
            <section
              class="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 dark:border-white/10 dark:bg-black sm:p-8"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-xl font-extrabold">{{ t("srs.why") }}</h2>
                <div
                  class="flex max-w-full items-start gap-2.5 rounded-2xl border border-primary-200/70 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-white/5"
                >
                  <span aria-hidden="true" class="text-base leading-6">✧</span>
                  <p class="text-xs font-medium leading-6 text-primary-700 dark:text-primary-200">
                    {{ t("srs.science") }}
                  </p>
                </div>
              </div>
              <ol class="mt-6 grid gap-4 md:grid-cols-3">
                <li
                  v-for="(key, i) in ['step1', 'step2', 'step3']"
                  :key="key"
                  class="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-5"
                >
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-600 dark:bg-white/10 dark:text-gray-200"
                    >{{ String(i + 1).padStart(2, "0") }}</span
                  >
                  <p class="pt-0.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {{ t("srs." + key) }}
                  </p>
                </li>
              </ol>
            </section>
          </div>

          <!-- Activity sidebar -->
          <aside class="min-w-0 xl:col-span-4">
            <SrsActivity :key="selectedTabId ?? 'all'" :tab-id="selectedTabId" />
          </aside>
        </div>
      </template>

      <!-- Loading -->
      <section
        v-else-if="phase === 'loading'"
        aria-live="polite"
        class="mx-auto max-w-2xl rounded-[28px] border border-gray-200 bg-white p-12 text-center dark:border-white/10 dark:bg-black"
      >
        <div
          class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500 dark:border-white/10 dark:border-t-primary-400"
        ></div>
        <p class="mt-5 font-medium text-gray-600 dark:text-gray-300">{{ t("srs.loading") }}</p>
      </section>

      <!-- Flashcard session -->
      <section
        v-else-if="phase === 'review' && currentCard"
        class="mx-auto min-w-0 max-w-4xl space-y-4 sm:space-y-5"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-gray-200"
            >
              {{ t("srs.session") }}
            </p>
            <h2 class="mt-1 text-xl font-bold">{{ t("srs.progress") }}</h2>
          </div>
          <button
            type="button"
            :disabled="submitting"
            class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-white/10 dark:bg-black dark:text-gray-300 dark:hover:text-primary-300 disabled:opacity-50"
            @click="leave"
          >
            {{ t("srs.back") }}
          </button>
        </div>
        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-black sm:p-5"
        >
          <div
            class="mb-3 flex justify-between gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400"
          >
            <span>{{ t("srs.cardOf", { current: index + 1, total: sessionCount }) }}</span>
            <span class="tabular-nums text-primary-600 dark:text-gray-200"
              >{{ progressPercent }}%</span
            >
          </div>
          <div
            class="h-2 overflow-hidden rounded-full bg-primary-100 dark:bg-white/10"
            role="progressbar"
            :aria-valuenow="index"
            :aria-valuemax="sessionCount"
            aria-valuemin="0"
          >
            <div
              class="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            ></div>
          </div>
        </div>

        <div
          :key="currentCard.id"
          class="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none"
        >
          <div
            class="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-5 pb-8 pt-8 text-center dark:border-white/10 dark:from-gray-950 dark:via-black dark:to-gray-950 sm:px-10 sm:pb-10 sm:pt-10"
          >
            <div
              aria-hidden="true"
              class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-secondary-200/30 blur-3xl dark:bg-white/5"
            ></div>
            <span
              class="relative inline-flex rounded-full border border-primary-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-primary-700 dark:border-white/10 dark:bg-gray-950 dark:text-primary-200"
            >
              {{
                currentCard.isPracticeOnly
                  ? t("srs.practiceBadge")
                  : currentCard.isNew
                    ? t("srs.newBadge")
                    : t("srs.reviewBadge")
              }}
            </span>
            <p class="relative mt-7 text-sm text-gray-500 dark:text-gray-400">
              {{ t("srs.question") }}
            </p>
            <h3
              class="relative mx-auto mt-4 max-w-3xl break-words text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
            >
              {{ currentCard.word }}
            </h3>
            <p
              v-if="currentCard.pronunciation"
              class="relative mt-3 text-base text-primary-600 dark:text-gray-200"
            >
              {{ currentCard.pronunciation }}
            </p>
            <button
              type="button"
              class="relative mt-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/85 px-4 py-2 text-sm font-semibold text-primary-600 transition hover:bg-primary-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-primary-500/15"
              @click="speak"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M11 5 6 9H3v6h3l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12" />
              </svg>
              {{ t("srs.speak") }}
            </button>
          </div>

          <div class="min-h-[190px] p-5 sm:p-8">
            <div
              v-if="!revealed"
              class="flex flex-col items-center justify-center gap-5 py-5 text-center"
            >
              <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">
                {{ t("srs.tapReveal") }}
              </p>
              <p
                v-if="hintVisible"
                class="rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 dark:bg-white/5 dark:text-gray-200"
              >
                {{ t("srs.hintLabel") }}: {{ currentCard.meaning?.trim().charAt(0) || "—" }}…
              </p>
              <div class="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-primary-300 dark:border-white/15 dark:text-gray-200"
                  @click="hintVisible = !hintVisible"
                >
                  {{ t("srs.hint") }}
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-7 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition hover:brightness-110"
                  @click="reveal"
                >
                  {{ t("srs.reveal") }}
                </button>
              </div>
            </div>
            <div v-else class="space-y-5" aria-live="polite">
              <div
                class="rounded-2xl border border-primary-100 bg-primary-50/70 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <p
                  class="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-gray-200"
                >
                  {{ t("srs.meaning") }}
                </p>
                <p
                  class="mt-2 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
                >
                  {{ currentCard.meaning }}
                </p>
              </div>
              <img
                v-if="currentCard.image"
                :src="mediaUrl(currentCard.image)"
                :alt="currentCard.word"
                loading="lazy"
                class="mx-auto max-h-48 max-w-full rounded-2xl border border-gray-100 object-contain dark:border-white/10"
              />
              <div
                v-if="currentCard.example || currentCard.exampleTranslation"
                class="grid gap-3 sm:grid-cols-2"
              >
                <div v-if="currentCard.example" class="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {{ t("srs.example") }}
                  </p>
                  <p class="mt-2 break-words text-sm leading-6">{{ currentCard.example }}</p>
                </div>
                <div
                  v-if="currentCard.exampleTranslation"
                  class="rounded-2xl bg-gray-50 p-4 dark:bg-white/5"
                >
                  <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {{ t("srs.translation") }}
                  </p>
                  <p class="mt-2 break-words text-sm leading-6">
                    {{ currentCard.exampleTranslation }}
                  </p>
                </div>
              </div>
              <p
                v-if="currentCard.note"
                class="break-words text-sm leading-6 text-gray-500 dark:text-gray-300"
              >
                <strong>{{ t("srs.note") }}:</strong> {{ currentCard.note }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="revealed"
          class="rounded-[28px] border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-black sm:p-7"
        >
          <div class="mb-5 text-center">
            <h3 class="text-lg font-bold">{{ t("srs.ratePrompt") }}</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t(currentCard.isPracticeOnly ? "srs.practiceRateTip" : "srs.rateTip") }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              v-for="rating in ratings"
              :key="rating.id"
              type="button"
              :disabled="submitting"
              class="min-w-0 rounded-2xl border px-3 py-4 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-wait disabled:opacity-60"
              :class="rating.classes"
              @click="rate(rating.id)"
            >
              <span class="block text-base font-extrabold">{{ t("srs." + rating.id) }}</span>
              <span class="mt-1 block text-xs opacity-75">{{ t("srs." + rating.id + "Sub") }}</span>
              <span class="mt-2 block text-[11px] font-semibold opacity-70">{{ rating.key }}</span>
            </button>
          </div>
          <p
            v-if="error === 'review'"
            role="alert"
            class="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-400"
          >
            {{ t("srs.saveError") }}
          </p>
        </div>
        <p class="hidden text-center text-xs text-gray-500 dark:text-gray-500 sm:block">
          {{ t("srs.shortcuts") }}
        </p>
      </section>

      <!-- Completion / no available words -->
      <section
        v-else-if="phase === 'complete'"
        class="mx-auto max-w-2xl rounded-[28px] border border-gray-200 bg-white p-7 text-center shadow-lg shadow-primary-500/5 dark:border-white/10 dark:bg-black dark:shadow-none sm:p-12"
      >
        <div
          class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 text-4xl dark:from-gray-800 dark:to-gray-900"
        >
          {{ sessionCount ? "✦" : "✓" }}
        </div>
        <h2 class="mt-6 text-2xl font-extrabold sm:text-3xl">
          {{ t(sessionCount ? "srs.finish" : "srs.empty") }}
        </h2>
        <p class="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
          {{
            t(
              sessionCount
                ? sessionIncludesScheduled
                  ? "srs.practiceFinishText"
                  : "srs.finishText"
                : "srs.emptyText",
            )
          }}
        </p>
        <div v-if="sessionCount" class="mt-7">
          <h3 class="mb-3 text-sm font-bold">{{ t("srs.summary") }}</h3>
          <div class="grid grid-cols-4 gap-2">
            <div
              v-for="rating in ratings"
              :key="rating.id"
              class="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5"
            >
              <p class="text-xl font-extrabold tabular-nums">{{ sessionRatings[rating.id] }}</p>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ t("srs." + rating.id) }}
              </p>
            </div>
          </div>
        </div>
        <p v-if="overview?.nextReviewAt" class="mt-6 text-sm text-gray-500 dark:text-gray-400">
          {{ t("srs.next") }}:
          <strong class="text-primary-600 dark:text-gray-200">{{
            formatNext(overview.nextReviewAt)
          }}</strong>
        </p>
        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            class="rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 text-sm font-bold text-white transition hover:brightness-110"
            @click="start(sessionSize, shouldPracticeScheduled || sessionIncludesScheduled)"
          >
            {{ t("srs.continue") }}
          </button>
          <button
            type="button"
            class="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold transition hover:bg-gray-50 dark:border-white/15 dark:hover:bg-white/5"
            @click="leave"
          >
            {{ t("srs.dashboard") }}
          </button>
        </div>
      </section>

      <section
        v-else-if="phase === 'error'"
        role="alert"
        class="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-white p-8 text-center dark:border-red-500/20 dark:bg-black"
      >
        <p class="text-red-600 dark:text-red-300">{{ t("srs.error") }}</p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-white"
          @click="start(sessionSize, shouldPracticeScheduled || sessionIncludesScheduled)"
        >
          {{ t("srs.retry") }}
        </button>
        <button
          type="button"
          class="ml-3 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold dark:border-white/20"
          @click="leave"
        >
          {{ t("srs.dashboard") }}
        </button>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { resolveAssetUrl } from "@/utils/assetUrl";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import apiService from "../../services/api.service";
import { useI18n } from "vue-i18n";
import { useSrs } from "./composables/useSrs";
import SrsActivity from "./SrsActivity.vue";
import SrsSessionSizeSelect from "./SrsSessionSizeSelect.vue";
import VocabularyAppTabs from "../Vocabulary/component/VocabularyAppTabs.vue";
import TabIcon from "../../components/common/TabIcon.vue";
import type { SrsRating } from "./types";

const { t, locale } = useI18n();
interface TabOption {
  id: string;
  name: string;
  icon?: string | null;
  isDefault?: boolean;
}
const selectedTabId = ref<string | null>(null);
const vocabularyTabs = ref<TabOption[]>([]);
const tabsLoading = ref(true);
const tabsError = ref(false);
const selectedTab = computed(() =>
  vocabularyTabs.value.find((tab) => tab.id === selectedTabId.value),
);
const selectedTabName = computed(() => selectedTab.value?.name ?? t("srs.tabAll"));
const selectedTabIcon = computed(() => selectedTab.value?.icon ?? null);

async function initializeTabs() {
  tabsLoading.value = true;
  tabsError.value = false;
  try {
    // Use the same tab and active-tab APIs as the vocabulary page.
    const [tabsResponse, settingsResponse] = await Promise.all([
      apiService.tab.getAll(),
      apiService.vocabulary.getSettings().catch(() => null),
    ]);
    vocabularyTabs.value = (tabsResponse.data as TabOption[]).map(
      ({ id, name, icon, isDefault }) => ({
        id,
        name,
        icon,
        isDefault,
      }),
    );
    const backendTabId: string | null = settingsResponse?.data?.activeTabId ?? null;
    selectedTabId.value =
      backendTabId && vocabularyTabs.value.some((tab) => tab.id === backendTabId)
        ? backendTabId
        : null;
  } catch {
    tabsError.value = true;
    selectedTabId.value = null;
  } finally {
    tabsLoading.value = false;
    changeTab();
  }
}

function selectTab(tabId: string | null) {
  if (phase.value !== "overview" || selectedTabId.value === tabId) return;
  selectedTabId.value = tabId;
  changeTab();
}
const {
  phase,
  overview,
  overviewLoading,
  currentCard,
  index,
  revealed,
  hintVisible,
  submitting,
  error,
  sessionCount,
  sessionIncludesScheduled,
  sessionRatings,
  progressPercent,

  refreshOverview,
  changeTab,
  start,
  reveal,
  rate,
  leave,
} = useSrs(selectedTabId);
const sessionSize = ref(20);
const shouldPracticeScheduled = computed(
  () => !!overview.value?.totalWords && !overview.value?.availableWords,
);
const dueNewTotal = computed(
  () => (overview.value?.dueWords ?? 0) + (overview.value?.newWords ?? 0),
);
const duePercent = computed(() =>
  dueNewTotal.value ? Math.round(((overview.value?.dueWords ?? 0) / dueNewTotal.value) * 100) : 0,
);
const stats = computed(() => [
  { key: "totalWords" as const, label: "srs.total", icon: "▤", bg: "bg-gray-100 dark:bg-white/10" },
  { key: "dueWords" as const, label: "srs.due", icon: "↻", bg: "bg-primary-100 dark:bg-white/10" },
  {
    key: "newWords" as const,
    label: "srs.new",
    icon: "✦",
    bg: "bg-secondary-100 dark:bg-white/10",
  },
  {
    key: "masteredWords" as const,
    label: "srs.mastered",
    icon: "✓",
    bg: "bg-primary-100 dark:bg-white/10",
  },
]);
const ratings: { id: SrsRating; key: string; classes: string }[] = [
  {
    id: "again",
    key: "1",
    classes:
      "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
  },
  {
    id: "hard",
    key: "2",
    classes:
      "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20",
  },
  {
    id: "good",
    key: "3",
    classes:
      "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-primary-500/20",
  },
  {
    id: "easy",
    key: "4",
    classes:
      "border-secondary-200 bg-secondary-50 text-secondary-700 hover:bg-secondary-100 dark:border-secondary-500/25 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-secondary-500/20",
  },
];

function formatNext(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("srs.noNext");
  const language =
    locale.value === "zh-CN"
      ? "zh-CN"
      : locale.value === "ko"
        ? "ko-KR"
        : locale.value === "vi"
          ? "vi-VN"
          : "en-US";
  return new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(
    date,
  );
}

function mediaUrl(value: string) {
  return resolveAssetUrl(value);
}

function speak() {
  const card = currentCard.value;
  if (!card) return;
  const fallback = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (card.audio) {
    const audio = new Audio(mediaUrl(card.audio));
    void audio.play().catch(fallback);
  } else {
    fallback();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (
    phase.value !== "review" ||
    submitting.value ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes((event.target as HTMLElement)?.tagName)) return;
  if (
    event.code === "Space" &&
    !revealed.value &&
    (event.target as HTMLElement)?.tagName !== "BUTTON"
  ) {
    event.preventDefault();
    reveal();
  } else if (revealed.value) {
    const rating = ratings[Number(event.key) - 1];
    if (rating) {
      event.preventDefault();
      void rate(rating.id);
    }
  }
}

let overviewRefreshTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  void initializeTabs();

  window.addEventListener("keydown", onKeydown);
  overviewRefreshTimer = setInterval(() => {
    if (phase.value === "overview") {
      void refreshOverview();
    }
  }, 60_000);
});
onBeforeUnmount(() => {
  if (overviewRefreshTimer) clearInterval(overviewRefreshTimer);
  window.removeEventListener("keydown", onKeydown);
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
</script>
