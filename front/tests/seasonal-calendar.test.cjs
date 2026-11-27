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
  assert.equal(schedule('2026-12-23T16:59:59Z').active, undefined)
  assert.equal(schedule('2026-12-23T17:00:00Z').active?.id, 'christmas')
  assert.equal(schedule('2026-12-25T17:00:00Z').active, undefined)
  assert.equal(schedule('2026-12-25T17:00:00Z').next?.id, 'newYear')
  assert.equal(millisecondsUntilVietnamMidnight(Date.parse('2026-12-23T16:59:59Z')), 1000)
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
  assert.equal(previewOptions.find((event) => event.id === 'tet').start, Date.UTC(2027, 1, 5))
})
