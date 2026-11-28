<template>
  <div v-if="calendar" data-guest-seasonal-preview class="shrink-0" :title="t('seasonalThemes.title')">
    <ModalSelect
      compact-trigger
      icon-trigger
      :label="t('seasonalThemes.title')"
      :model-value="currentId"
      :options="options"
      :max-visible-options="6"
      @update:model-value="chooseEvent"
    >
      <template #trigger-content>
        <span class="sr-only">{{ t(calendar.previewEvent.value ? 'seasonalThemes.previewing' : 'seasonalThemes.preview') }}</span>
        <img v-if="calendar.previewEvent.value" :src="iconFor(currentId)" alt="" class="h-7 w-7 object-contain" width="28" height="28" decoding="async" />
        <svg v-else class="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18h1.5a1.8 1.8 0 0 0 1.1-3.2 1.8 1.8 0 0 1 1.1-3.2H18a3 3 0 0 0 3-3C21 6.9 17 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>
        </svg>
      </template>
      <template #option-content="{ option }">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-100 dark:bg-white/5">
          <img v-if="option.value !== 'none'" :src="iconFor(option.value)" alt="" class="h-9 w-9 object-contain" width="36" height="36" decoding="async" />
          <svg v-else class="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18m-13 5h8"/></svg>
        </span>
        <span class="min-w-0 flex-1 break-words">{{ option.label }}</span>
      </template>
    </ModalSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalSelect from '../../common/ModalSelect.vue'
import { seasonalCalendarKey } from '../../../composables/useSeasonalCalendar'

const { t } = useI18n()
const calendar = inject(seasonalCalendarKey)
const currentId = computed(() => calendar?.previewEvent.value?.id ?? 'none')
const icons = import.meta.glob('../../../assets/seasonal/preview/*-preview.webp', { eager: true, import: 'default', query: '?url' }) as Record<string, string>
const iconFor = (id: string) => icons['../../../assets/seasonal/preview/' + id + '-preview.webp']
const options = computed(() => [
  { value: 'none', label: t('seasonalThemes.stopPreview') },
  ...(calendar?.schedule.value.previewOptions ?? []).map(event => ({
    value: event.id,
    label: t('seasonalThemes.events.' + event.id + '.title'),
  })),
])
function chooseEvent(value: string | string[]) {
  if (!calendar || typeof value !== 'string') return
  if (value === 'none') { calendar.stopPreview(); return }
  const event = calendar.schedule.value.previewOptions.find(item => item.id === value)
  if (event) calendar.startPreview(event.id)
}
</script>
