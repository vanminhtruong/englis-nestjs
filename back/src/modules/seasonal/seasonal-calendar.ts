import { lunarToSolar } from '@tindoaneiu/vietnamese-lunar-calendar'

const dayMs = 86_400_000
const vietnamOffsetMs = 7 * 60 * 60 * 1000

const events = [
  { id: 'newYear', month: 1, day: 1, before: 1, after: 1, tone: 'sparkle', symbol: '✦' },
  { id: 'tet', month: 1, day: 1, lunar: true, before: 3, after: 3, tone: 'lantern', symbol: '🏮' },
  { id: 'womensDay', month: 3, day: 8, before: 1, after: 1, tone: 'bloom', symbol: '✿' },
  { id: 'hungKings', month: 3, day: 10, lunar: true, before: 1, after: 1, tone: 'heritage', symbol: '◈' },
  { id: 'aprilMay', month: 4, day: 30, before: 1, after: 1, tone: 'heritage', symbol: '★' },
  { id: 'nationalDay', month: 9, day: 2, before: 1, after: 1, tone: 'heritage', symbol: '★' },
  { id: 'midAutumn', month: 8, day: 15, lunar: true, before: 1, after: 1, tone: 'moon', symbol: '☾' },
  { id: 'vietnamWomensDay', month: 10, day: 20, before: 1, after: 1, tone: 'bloom', symbol: '✿' },
  { id: 'halloween', month: 10, day: 31, before: 1, after: 1, tone: 'autumn', symbol: '🎃' },
  { id: 'teachersDay', month: 11, day: 20, before: 1, after: 1, tone: 'ink', symbol: '✎' },
  { id: 'christmas', month: 12, day: 25, before: 4, after: 2, tone: 'christmas', symbol: '❄' },
] as const

type EventDefinition = (typeof events)[number]

export type SeasonalEvent = EventDefinition & {
  start: number
  end: number
}

export function vietnamCalendarDay(timestamp: number): number {
  return Math.floor((timestamp + vietnamOffsetMs) / dayMs) * dayMs
}

export function millisecondsUntilVietnamMidnight(timestamp: number): number {
  return vietnamCalendarDay(timestamp) + dayMs - (timestamp + vietnamOffsetMs)
}

function eventsInYear(year: number): SeasonalEvent[] {
  return events.flatMap((event) => {
    let date = Date.UTC(year, event.month - 1, event.day)
    if ('lunar' in event) {
      if (year < 1901 || year > 2099) return []
      const lunarDate = [event.day, event.month, year].map((part) => String(part).padStart(2, '0')).join('/')
      const [day, month, solarYear] = lunarToSolar(lunarDate).date.split('/').map(Number)
      if (day === undefined || month === undefined || solarYear === undefined) return []
      date = Date.UTC(solarYear, month - 1, day)
    }

    const before = 'before' in event ? event.before : 0
    const after = 'after' in event ? event.after : 0
    return [{ ...event, start: date - before * dayMs, end: date + after * dayMs }]
  })
}

export function getSeasonalSchedule(today: number) {
  const year = new Date(today).getUTCFullYear()
  const schedule = [...eventsInYear(year - 1), ...eventsInYear(year), ...eventsInYear(year + 1)]
    .sort((first, second) => first.start - second.start)
  const upcoming = schedule.filter((event) => event.end >= today)
  const previewOptions = new Map<SeasonalEvent['id'], SeasonalEvent>()
  for (const event of upcoming) {
    if (!previewOptions.has(event.id)) previewOptions.set(event.id, event)
  }
  // Persist every real occurrence; the UI can show only one theme at a time.
  // Prefer the actual celebration day, then the closest celebration day.
  const activeEvents = upcoming.filter(event => event.start <= today).sort((a, b) => {
    const distance = (event: SeasonalEvent) => Math.abs(today - (event.start + event.before * dayMs))
    return distance(a) - distance(b) || a.start - b.start || a.id.localeCompare(b.id)
  })
  return {
    active: activeEvents[0],
    activeEvents,
    next: upcoming.find((event) => event.start > today),
    previewOptions: [...previewOptions.values()],
  }
}

export function formatSeasonalDates(event: SeasonalEvent, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return event.start === event.end
    ? formatter.format(event.start)
    : [formatter.format(event.start), formatter.format(event.end)].join(' – ')
}
