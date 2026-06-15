import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { ActivityLevel } from '../app/lib/profile-options'
import { calculateTDE } from '../app/lib/tde'

describe('calculateTDE', () => {
  it('calculates and rounds male TDEE with the Mifflin-St Jeor equation', () => {
    assert.equal(calculateTDE({ weightKg: 80, heightCm: 180, age: 30, gender: 'male', activityLevel: 'moderately_active' }), 2759)
  })

  it('calculates and rounds female TDEE with the Mifflin-St Jeor equation', () => {
    assert.equal(calculateTDE({ weightKg: 65, heightCm: 165, age: 35, gender: 'female', activityLevel: 'lightly_active' }), 1850)
  })

  it('supports every configured activity level', () => {
    const levels: ActivityLevel[] = [
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extra_active',
    ]

    const results = levels.map((activityLevel) => calculateTDE({
      weightKg: 70,
      heightCm: 175,
      age: 30,
      gender: 'male',
      activityLevel,
    }))

    assert.deepEqual(results, [1979, 2267, 2556, 2844, 3133])
  })

  it('rejects non-positive and non-finite numeric inputs', () => {
    const validInput = { heightCm: 180, age: 30, gender: 'male' as const, activityLevel: 'sedentary' as const }

    assert.throws(() => calculateTDE({ ...validInput, weightKg: 0 }), /positive finite numbers/)
    assert.throws(() => calculateTDE({ ...validInput, weightKg: Number.NaN }), /positive finite numbers/)
    assert.throws(() => calculateTDE({ ...validInput, weightKg: Number.POSITIVE_INFINITY }), /positive finite numbers/)
  })

  it('defensively rejects unsupported runtime gender and activity values', () => {
    assert.throws(
      () => calculateTDE({ weightKg: 80, heightCm: 180, age: 30, gender: 'other', activityLevel: 'sedentary' } as never),
      /Gender must be either/,
    )
    assert.throws(
      () => calculateTDE({ weightKg: 80, heightCm: 180, age: 30, gender: 'male', activityLevel: 'sometimes_active' } as never),
      /Invalid activity level/,
    )
  })
})
