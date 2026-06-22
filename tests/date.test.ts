import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { DateKeySchema, formatLocalDate, getLocalWeekRange, parseDateKey } from '../app/lib/date'

describe('local date domain', () => {
  it('formats dates from local calendar fields', () => {
    assert.equal(formatLocalDate(new Date(2026, 0, 2, 23, 30)), '2026-01-02')
    assert.equal(formatLocalDate(new Date(2026, 10, 9, 0, 5)), '2026-11-09')
  })

  it('accepts real ISO date keys and rejects impossible dates', () => {
    assert.equal(parseDateKey('2024-02-29'), '2024-02-29')
    assert.equal(DateKeySchema.safeParse('2025-02-29').success, false)
    assert.equal(DateKeySchema.safeParse('2026-13-01').success, false)
    assert.equal(DateKeySchema.safeParse('06/14/2026').success, false)
  })

  it('returns local Sunday-through-Saturday boundaries and keys', () => {
    const range = getLocalWeekRange(new Date(2026, 5, 17, 12))
    assert.equal(formatLocalDate(range.weekStart), '2026-06-14')
    assert.equal(formatLocalDate(range.weekEnd), '2026-06-20')
    assert.equal(range.startDateKey, '2026-06-14')
    assert.equal(range.endDateKey, '2026-06-20')
    assert.equal(range.weekStart.getHours(), 0)
    assert.equal(range.weekEnd.getHours(), 23)
  })
})

describe('local date usage contract', () => {
  it('does not derive daily database keys from UTC serialization', () => {
    const sources = [
      'app/lib/client-database.ts',
      'app/lib/workout-generator.ts',
      'app/protected/profile/meal-plan/action.ts',
      'app/components/WeeklyProgress.tsx',
    ].map((path) => readFileSync(path, 'utf8'))

    for (const source of sources) {
      assert.doesNotMatch(source, /toISOString\(\)\.split\(['"]T['"]\)\[0\]/)
    }
  })

  it('passes validated browser-local date keys into generation actions', () => {
    const workoutUi = readFileSync('app/components/WorkoutTemplates.tsx', 'utf8')
    const mealUi = readFileSync('app/protected/profile/meal-plan/page.tsx', 'utf8')
    const workoutAction = readFileSync('app/lib/workout-generator.ts', 'utf8')
    const mealAction = readFileSync('app/protected/profile/meal-plan/action.ts', 'utf8')

    assert.match(workoutUi, /getLocalDateKey\(\)/)
    assert.match(mealUi, /getLocalDateKey\(\)/)
    assert.match(workoutAction, /parseDateKey\(dateInput\)/)
    assert.match(mealAction, /parseDateKey\(dateInput\)/)
  })
})
