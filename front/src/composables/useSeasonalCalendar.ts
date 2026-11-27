import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { InjectionKey } from 'vue'
import {
  getSeasonalSchedule,
  millisecondsUntilVietnamMidnight,
  vietnamCalendarDay,
  type SeasonalEvent,
} from '../utils/seasonalCalendar'

export const seasonalCalendarKey: InjectionKey<ReturnType<typeof useSeasonalCalendar>> =
  Symbol('seasonal calendar')

export function useSeasonalCalendar() {
  const today = ref(vietnamCalendarDay(Date.now()))
  const schedule = computed(() => getSeasonalSchedule(today.value))
  const previewId = ref<SeasonalEvent['id']>()
  const previewEvent = computed(() => schedule.value.previewOptions.find((event) => event.id === previewId.value))
  let timer: ReturnType<typeof setTimeout> | undefined

  function refresh() {
    const now = Date.now()
    today.value = vietnamCalendarDay(now)
    clearTimeout(timer)
    timer = setTimeout(refresh, millisecondsUntilVietnamMidnight(now))
  }

  onMounted(() => {
    refresh()
    document.addEventListener('visibilitychange', refresh)
  })
  onUnmounted(() => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', refresh)
  })

  function startPreview(id: SeasonalEvent['id']) {
    previewId.value = id
  }

  function stopPreview() {
    previewId.value = undefined
  }

  return { schedule, previewEvent, startPreview, stopPreview }
}
