import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { assertGenerationAllowed, GENERATION_RATE_LIMIT, resetGenerationRateLimit } from '../app/lib/generation-rate-limit'
import { createFixedWindowRateLimiter } from '../app/lib/rate-limit'

describe('fixed-window rate limiter', () => {
  it('allows requests until the limit and returns retry timing after exhaustion', () => {
    const limiter = createFixedWindowRateLimiter({ limit: 2, windowMs: 1_000 })

    assert.deepEqual(limiter.check('user-1', 10), {
      allowed: true,
      remaining: 1,
      limit: 2,
      resetAt: 1_010,
      retryAfterMs: 0,
    })
    assert.equal(limiter.check('user-1', 20).allowed, true)

    const blocked = limiter.check('user-1', 30)
    assert.equal(blocked.allowed, false)
    assert.equal(blocked.remaining, 0)
    assert.equal(blocked.retryAfterMs, 980)
  })

  it('resets the window after the configured duration', () => {
    const limiter = createFixedWindowRateLimiter({ limit: 1, windowMs: 1_000 })

    assert.equal(limiter.check('user-1', 10).allowed, true)
    assert.equal(limiter.check('user-1', 20).allowed, false)
    assert.equal(limiter.check('user-1', 1_011).allowed, true)
  })

  it('keeps separate buckets per identifier', () => {
    const limiter = createFixedWindowRateLimiter({ limit: 1, windowMs: 1_000 })

    assert.equal(limiter.check('meal:user-1', 10).allowed, true)
    assert.equal(limiter.check('meal:user-1', 20).allowed, false)
    assert.equal(limiter.check('workout:user-1', 20).allowed, true)
    assert.equal(limiter.check('meal:user-2', 20).allowed, true)
  })
})

describe('generation abuse-protection contract', () => {
  it('rate-limits each generation action independently without leaking raw user IDs in logs', () => {
    resetGenerationRateLimit()
    const originalWarn = console.warn
    const warnings: string[] = []
    console.warn = (message?: unknown) => warnings.push(String(message))

    try {
      for (let count = 0; count < GENERATION_RATE_LIMIT.limit; count += 1) {
        assertGenerationAllowed('sensitive-user-id', 'meal_plan')
      }

      assert.throws(
        () => assertGenerationAllowed('sensitive-user-id', 'meal_plan'),
        /Generation rate limit exceeded/,
      )
      assertGenerationAllowed('sensitive-user-id', 'workout_plan')
    } finally {
      console.warn = originalWarn
      resetGenerationRateLimit()
    }

    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /generation\.rate_limited/)
    assert.doesNotMatch(warnings[0], /sensitive-user-id/)
  })
})
