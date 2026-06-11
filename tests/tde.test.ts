import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { calculateTDE } from '../app/lib/tde'

describe('calculateTDE', () => {
  it('calculates and rounds male TDEE with the Mifflin-St Jeor equation', () => {
    assert.equal(calculateTDE(80, 180, 30, 'male', 'moderately_active'), 2759)
  })

  it('calculates and rounds female TDEE with the Mifflin-St Jeor equation', () => {
    assert.equal(calculateTDE(65, 165, 35, 'female', 'lightly_active'), 1850)
  })

  it('supports every configured activity level', () => {
    const levels = [
      'sedentary',
      'lightly_active',
      'moderately_active',
      'very_active',
      'extra_active',
    ]

    const results = levels.map((level) => calculateTDE(70, 175, 30, 'male', level))

    assert.deepEqual(results, [1979, 2267, 2556, 2844, 3133])
  })

  it('rejects non-positive numeric inputs', () => {
    assert.throws(
      () => calculateTDE(0, 180, 30, 'male', 'sedentary'),
      /must be positive numbers/,
    )
    assert.throws(
      () => calculateTDE(80, -1, 30, 'male', 'sedentary'),
      /must be positive numbers/,
    )
    assert.throws(
      () => calculateTDE(80, 180, 0, 'male', 'sedentary'),
      /must be positive numbers/,
    )
  })

  it('rejects unsupported gender and activity values', () => {
    assert.throws(
      () => calculateTDE(80, 180, 30, 'other', 'sedentary'),
      /Gender must be either/,
    )
    assert.throws(
      () => calculateTDE(80, 180, 30, 'male', 'sometimes_active'),
      /Invalid activity level/,
    )
  })
})
