const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { join } = require('node:path')
const { test } = require('node:test')
const { runInNewContext } = require('node:vm')
const ts = require('typescript')

const file = join(__dirname, '../src/utils/seasonalCalendar.ts')
const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
})
const moduleUnderTest = { exports: {} }
runInNewContext(outputText, { module: moduleUnderTest, exports: moduleUnderTest.exports, require }, { filename: file })
const { getSeasonalSchedule, millisecondsUntilVietnamMidnight, vietnamCalendarDay } = moduleUnderTest.exports

const schedule = (timestamp) => getSeasonalSchedule(vietnamCalendarDay(Date.parse(timestamp)))

test('starts and ends a solar event at midnight in Vietnam', () => {
  assert.equal(schedule('2026-12-20T16:59:59Z').active, undefined)
  assert.equal(schedule('2026-12-20T17:00:00Z').active?.id, 'christmas')
  assert.equal(schedule('2026-12-27T17:00:00Z').active, undefined)
  assert.equal(schedule('2026-12-27T17:00:00Z').next?.id, 'newYear')
  assert.equal(millisecondsUntilVietnamMidnight(Date.parse('2026-12-20T16:59:59Z')), 1000)
})

test('finds lunar events each year and leaves ordinary dates clear', () => {
  assert.equal(schedule('2026-02-17T03:00:00Z').active?.id, 'tet')
  assert.equal(schedule('2027-02-06T03:00:00Z').active?.id, 'tet')
  assert.equal(schedule('2026-04-26T03:00:00Z').active?.id, 'hungKings')
  assert.equal(schedule('2026-09-25T03:00:00Z').active?.id, 'midAutumn')
  assert.equal(schedule('2026-11-27T03:00:00Z').active, undefined)
})

test('offers each theme once even when its next celebration falls in another year', () => {
  const { previewOptions } = schedule('2026-11-27T03:00:00Z')
  assert.equal(previewOptions.length, 11)
  assert.equal(new Set(previewOptions.map((event) => event.id)).size, 11)
  assert.equal(previewOptions[0].id, 'christmas')
  assert.equal(previewOptions.find((event) => event.id === 'tet').start, Date.UTC(2027, 1, 3))
})

test('all eleven events have the agreed inclusive duration and exact boundaries', () => {
  const day = 86400000
  const { previewOptions } = schedule('2026-11-28T00:00:00Z')
  for (const event of previewOptions) {
    const expected = ['christmas', 'tet'].includes(event.id) ? 7 : 3
    assert.equal((event.end - event.start) / day + 1, expected, event.id)
    assert.equal(getSeasonalSchedule(event.start - day).activeEvents.some(e => e.id === event.id), false, event.id)
    assert.equal(getSeasonalSchedule(event.start).activeEvents.some(e => e.id === event.id), true, event.id)
    assert.equal(getSeasonalSchedule(event.end).activeEvents.some(e => e.id === event.id), true, event.id)
    assert.equal(getSeasonalSchedule(event.end + day).activeEvents.some(e => e.id === event.id), false, event.id)
    console.log(event.id, new Date(event.start).toISOString().slice(0, 10), new Date(event.end).toISOString().slice(0, 10), expected)
  }
})
test('new year crosses December into January without overlapping Christmas', () => {
  assert.equal(schedule('2026-12-30T16:59:59Z').active, undefined)
  assert.equal(schedule('2026-12-30T17:00:00Z').active?.id, 'newYear')
  assert.equal(schedule('2027-01-02T16:59:59Z').active?.id, 'newYear')
  assert.equal(schedule('2027-01-02T17:00:00Z').active, undefined)
})
test('overlapping lunar and solar holidays both remain active with actual day priority', () => {
  const a = schedule('2023-04-29T05:00:00Z')
  assert.equal(a.active?.id, 'hungKings')
  assert.equal(a.activeEvents.length, 2)
  const b = schedule('2023-04-30T05:00:00Z')
  assert.equal(b.active?.id, 'aprilMay')
  assert.equal(b.activeEvents.length, 2)
})
test('front and back calendar sources are identical', () => {
  assert.equal(readFileSync(file, 'utf8'), readFileSync(join(__dirname, '../../back/src/modules/seasonal/seasonal-calendar.ts'), 'utf8'))
})
