<template>
  <section class="px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8" aria-labelledby="seasonal-event-title">
    <div class="seasonal-banner seasonal-hero mx-auto max-w-[1400px] rounded-[1.4rem] border">
      <div class="seasonal-hero-copy">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span v-if="previewing" class="seasonal-date seasonal-preview-status text-xs font-semibold">{{ t('seasonalThemes.previewing') }}</span>
          <span class="seasonal-date text-xs font-semibold">{{ dateLabel }}</span>
        </div>
        <h2 id="seasonal-event-title" tabindex="-1" class="text-xl font-extrabold leading-tight tracking-tight text-gray-900 focus:outline-none dark:text-white sm:text-3xl lg:text-4xl">
          {{ t(`seasonalThemes.events.${event.id}.title`) }}
        </h2>
        <p class="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-gray-700 dark:text-gray-200 sm:mt-2 sm:text-base">
          {{ t(`seasonalThemes.events.${event.id}.message`) }}
        </p>
        <button
          v-if="previewing"
          type="button"
          data-seasonal-preview-exit
          class="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-white/20 dark:bg-black/60 dark:text-white dark:hover:bg-black sm:mt-4"
          @click="$emit('stop-preview')"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          {{ t('seasonalThemes.stopPreview') }}
        </button>
        <img v-if="scene" :src="scene" class="seasonal-hero-secondary" alt="" aria-hidden="true" width="900" height="375" decoding="async" />
      </div>
      <div class="seasonal-hero-stage" aria-hidden="true">
        <span class="seasonal-stage-spark seasonal-stage-spark-first">✦</span>
        <span class="seasonal-stage-spark seasonal-stage-spark-second">✧</span>
        <span class="seasonal-stage-spark seasonal-stage-spark-third">{{ event.symbol }}</span>
        <img v-if="art" :src="art" :key="event.id" alt="" class="seasonal-hero-art" width="500" height="222" decoding="async" />
        <span v-else class="seasonal-emblem">{{ event.symbol }}</span>
        <SeasonalMotifStrip :event-id="event.id" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SeasonalMotifStrip from './SeasonalMotifStrip.vue'
import { useI18n } from 'vue-i18n'
import { formatSeasonalDates, type SeasonalEvent } from '../../utils/seasonalCalendar'
import { seasonalIllustration, seasonalScene } from '../../utils/seasonalDecor'

const props = defineProps<{ event: SeasonalEvent; previewing: boolean }>()
defineEmits<{ 'stop-preview': [] }>()

const { t, locale } = useI18n()
const art = computed(() => seasonalIllustration(props.event.id))
const scene = computed(() => seasonalScene(props.event.id))
const dateLabel = computed(() => formatSeasonalDates(props.event, locale.value))
</script>
