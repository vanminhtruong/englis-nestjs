<template>
  <section
    aria-labelledby="seasonal-preferences-title"
    class="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
  >
    <div class="min-w-0 self-center p-4 sm:p-6 lg:p-7">
      <div class="flex items-start gap-3 sm:gap-4">
        <span
          class="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-secondary-100 text-primary-700 dark:border-primary-400/25 dark:from-primary-900/40 dark:to-secondary-900/30 dark:text-primary-200 sm:h-14 sm:w-14"
          aria-hidden="true"
        >
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 3v4m7-4v4M4 9h14M18 11V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8" />
            <path d="m18 13 1.05 2.95L22 17l-2.95 1.05L18 21l-1.05-2.95L14 17l2.95-1.05L18 13Z" />
            <path d="M8 13h3m-3 3h2" />
          </svg>
        </span>
        <div class="min-w-0">
          <h2 id="seasonal-preferences-title" class="text-lg font-bold leading-tight text-gray-900 dark:text-white sm:text-xl">
            {{ t('seasonalThemes.title') }}
          </h2>
          <p id="seasonal-preferences-description" class="mt-1.5 max-w-[39ch] text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {{ t('seasonalThemes.description') }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1 dark:border-white/10 dark:bg-black/25 sm:mt-5">
        <span
          class="inline-flex min-w-0 items-center gap-2 text-sm font-semibold"
          :class="enabled ? 'text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300'"
          aria-hidden="true"
        >
          <span class="h-2 w-2 shrink-0 rounded-full" :class="enabled ? 'bg-primary-500 dark:bg-primary-400' : 'bg-gray-400 dark:bg-gray-500'" />
          {{ t(enabled ? 'seasonalThemes.enabled' : 'seasonalThemes.disabled') }}
        </span>
        <button
          type="button"
          role="switch"
          :aria-checked="enabled"
          :aria-busy="saving"
          aria-labelledby="seasonal-preferences-title"
          aria-describedby="seasonal-preferences-description"
          :disabled="saving"
          class="grid min-h-[44px] shrink-0 place-items-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-wait disabled:opacity-60"
          @click="$emit('change', !enabled)"
        >
          <span
            aria-hidden="true"
            class="relative h-[32px] w-[56px] rounded-full ring-1 ring-inset motion-safe:transition-colors"
            :class="enabled ? 'bg-gradient-to-r from-primary-700 to-primary-600 ring-primary-600 dark:from-primary-600 dark:to-secondary-600 dark:ring-primary-400/30' : 'bg-gray-300 ring-gray-400/50 dark:bg-gray-700 dark:ring-white/15'"
          >
            <span
              class="absolute left-[4px] top-[4px] grid h-[24px] w-[24px] place-items-center rounded-full bg-white shadow-md motion-safe:transition-transform"
              :class="{ 'translate-x-[24px]': enabled }"
            >
              <svg v-if="enabled" class="h-3.5 w-3.5 text-primary-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3.5 8 3 3 6-6" />
              </svg>
            </span>
          </span>
        </button>
      </div>
    </div>

    <div v-if="sampleEvent" class="min-w-0 border-t border-gray-200 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-black/25 sm:p-6 lg:border-l lg:border-t-0 lg:p-7">
      <div
        :data-seasonal-tone="sampleEvent.tone"
        class="seasonal-banner seasonal-preview-sample flex-wrap rounded-xl border px-3.5 py-4 sm:px-4"
      >
        <img v-if="sampleArt" :src="sampleArt" alt="" class="seasonal-sample-art" decoding="async" />
        <div class="relative flex min-w-0 flex-1 items-start gap-3">
          <span class="seasonal-emblem" aria-hidden="true">{{ sampleEvent.symbol }}</span>
          <div class="min-w-0 space-y-1.5">
            <p v-if="eventStatus" class="seasonal-preview-status text-xs font-semibold">{{ t(eventStatus) }}</p>
            <h3 class="text-base font-bold leading-tight text-gray-900 dark:text-white sm:text-lg">
              {{ t(`seasonalThemes.events.${sampleEvent.id}.title`) }}
            </h3>
            <span class="seasonal-date inline-block text-xs font-semibold">{{ dateLabel }}</span>
          </div>
        </div>
      </div>

      <div class="mt-3 grid min-w-0 items-end gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <ModalSelect
          :label="t('seasonalThemes.chooseEvent')"
          :model-value="sampleEvent.id"
          :options="eventOptions"
          :max-visible-options="6"
          @update:model-value="selectEvent"
        />
        <button
          type="button"
          data-seasonal-preview-action
          class="flex min-h-12 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 motion-safe:transition-colors"
          :class="previewingSample
            ? 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
            : 'bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700'"
          @click="togglePreview"
        >
          <svg v-if="!previewingSample" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
          {{ t(previewingSample ? 'seasonalThemes.stopPreview' : 'seasonalThemes.preview') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalSelect from '../../../components/common/ModalSelect.vue'
import { seasonalCalendarKey } from '../../../composables/useSeasonalCalendar'
import { formatSeasonalDates } from '../../../utils/seasonalCalendar'
import { seasonalIllustration } from '../../../utils/seasonalDecor'

defineProps<{ enabled: boolean; saving: boolean }>()
defineEmits<{ change: [enabled: boolean] }>()

const { t, locale } = useI18n()
const calendar = inject(seasonalCalendarKey)
const schedule = computed(() => calendar?.schedule.value)
const selectedEventId = ref('')
const sampleEvent = computed(() =>
  schedule.value?.previewOptions.find((event) => event.id === selectedEventId.value)
  ?? calendar?.previewEvent.value
  ?? calendar?.realEvent.value
  ?? schedule.value?.next,
)
const eventOptions = computed(() => (schedule.value?.previewOptions ?? []).map((event) => ({
  value: event.id,
  label: t(`seasonalThemes.events.${event.id}.title`),
})))
const sampleArt = computed(() => sampleEvent.value ? seasonalIllustration(sampleEvent.value.id) : undefined)
const dateLabel = computed(() => sampleEvent.value ? formatSeasonalDates(sampleEvent.value, locale.value) : '')
const previewingSample = computed(() => Boolean(
  sampleEvent.value && sampleEvent.value.id === calendar?.previewEvent.value?.id,
))
const eventStatus = computed(() => {
  if (previewingSample.value) return 'seasonalThemes.previewing'
  if (sampleEvent.value?.id === calendar?.realEvent.value?.id) return 'seasonalThemes.active'
  if (sampleEvent.value?.id === schedule.value?.next?.id) return 'seasonalThemes.next'
  return undefined
})

function selectEvent(value: string | string[]) {
  if (typeof value === 'string') selectedEventId.value = value
}

async function togglePreview() {
  if (!calendar || !sampleEvent.value) return
  if (previewingSample.value) {
    calendar.stopPreview()
    return
  }
  calendar.startPreview(sampleEvent.value.id)
  await nextTick()
  document.getElementById('seasonal-event-title')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>
