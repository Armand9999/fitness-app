import { logWarning } from './logger'
import { createFixedWindowRateLimiter } from './rate-limit'

export const GENERATION_RATE_LIMIT = {
  limit: 10,
  windowMs: 60 * 60 * 1000,
} as const

const generationLimiter = createFixedWindowRateLimiter(GENERATION_RATE_LIMIT)

type GenerationAction = 'meal_plan' | 'workout_plan'

export function assertGenerationAllowed(userId: string, action: GenerationAction) {
  const key = `${action}:${userId}`
  const result = generationLimiter.check(key)

  if (!result.allowed) {
    logWarning('generation.rate_limited', {
      action,
      limit: result.limit,
      retryAfterMs: result.retryAfterMs,
      resetAt: new Date(result.resetAt).toISOString(),
    })
    throw new Error('Generation rate limit exceeded. Please try again later.')
  }

  return result
}

export function resetGenerationRateLimit(userId?: string, action?: GenerationAction) {
  if (userId && action) generationLimiter.reset(`${action}:${userId}`)
  else generationLimiter.reset()
}
