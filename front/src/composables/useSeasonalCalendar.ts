import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { InjectionKey } from 'vue'
import apiService from '../services/api.service'
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
  // A manual preview belongs to this browser, not to a user account.
  const previewStorageKey = 'vocabmaster.seasonal-preview'
  function validPreviewId(value: string | null | undefined) {
    return schedule.value.previewOptions.find(event => event.id === value)?.id
  }
  function readPreviewId() {
    try {
      return validPreviewId(localStorage.getItem(previewStorageKey))
    } catch {
      return undefined
    }
  }
  const previewId = ref<SeasonalEvent['id'] | undefined>(readPreviewId())

  function syncPreview(event: StorageEvent) {
    if (event.key === previewStorageKey || event.key === null) {
      previewId.value = readPreviewId()
    }
  }
  const previewEvent = computed(() => schedule.value.previewOptions.find((event) => event.id === previewId.value))
  let timer: ReturnType<typeof setTimeout> | undefined
  const realEvent = ref<SeasonalEvent>()
  let serverTimer: ReturnType<typeof setTimeout> | undefined
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  let syncing = false
  let disposed = false

  // Real events are authoritative only when confirmed by the server. Never
  // derive an actual activation from the browser clock or localStorage.
  async function syncRealEvent() {
    if (syncing || disposed) return
    syncing = true
    clearTimeout(serverTimer)
    let delay = 30_000
    try {
      const { data } = await apiService.seasonal.getState()
      if (disposed) return
      if (!Number.isFinite(data?.serverNow) || !Number.isFinite(data?.nextSyncAt)) throw new Error("Invalid seasonal state")
      clearTimeout(expiryTimer)
      const active = data.active
      if (active?.status === "active" && active.event?.id === active.eventId && validPreviewId(active.eventId) && active.startsAt <= data.serverNow && active.endsAt > data.serverNow) {
        realEvent.value = active.event
        expiryTimer = setTimeout(() => { realEvent.value = undefined; void syncRealEvent() }, Math.max(1, active.endsAt - data.serverNow))
      } else {
        realEvent.value = undefined
      }
      delay = Math.min(30_000, Math.max(100, data.nextSyncAt - data.serverNow + 100))
    } catch {
      // A temporary network failure does not activate a client-clock event.
      // An already confirmed event expires at its server-provided boundary.
    } finally {
      syncing = false
      if (!disposed) serverTimer = setTimeout(syncRealEvent, delay)
    }
  }

  function onVisible() {
    refresh()
    if (!document.hidden) void syncRealEvent()
  }

  function refresh() {
    const now = Date.now()
    today.value = vietnamCalendarDay(now)
    clearTimeout(timer)
    timer = setTimeout(refresh, millisecondsUntilVietnamMidnight(now))
  }

  onMounted(() => {
    refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', syncRealEvent)
    void syncRealEvent()
    window.addEventListener('storage', syncPreview)
  })
  onUnmounted(() => {
    clearTimeout(timer)
    disposed = true
    clearTimeout(serverTimer)
    clearTimeout(expiryTimer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('online', syncRealEvent)
    window.removeEventListener('storage', syncPreview)
  })

  function startPreview(id: SeasonalEvent['id']) {
    const valid = validPreviewId(id)
    if (!valid) return
    previewId.value = valid
    try {
      localStorage.setItem(previewStorageKey, valid)
    } catch {
      // Preview still works in memory when browser storage is unavailable.
    }
  }

  function stopPreview() {
    previewId.value = undefined
    try {
      localStorage.removeItem(previewStorageKey)
    } catch {
      // Browser storage may be blocked; still exit the current preview.
    }
  }

  return { schedule, realEvent, previewEvent, startPreview, stopPreview }
}
