type RateLimitState = {
  count: number
  resetAt: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number
  retryAfterMs: number
}

export type FixedWindowRateLimiterOptions = {
  limit: number
  windowMs: number
}

export function createFixedWindowRateLimiter({ limit, windowMs }: FixedWindowRateLimiterOptions) {
  if (!Number.isInteger(limit) || limit <= 0) throw new Error('Rate limit must be a positive integer')
  if (!Number.isInteger(windowMs) || windowMs <= 0) throw new Error('Rate limit window must be a positive integer')

  const buckets = new Map<string, RateLimitState>()

  function check(identifier: string, now = Date.now()): RateLimitResult {
    const existing = buckets.get(identifier)
    const current = existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowMs }

    if (current.count >= limit) {
      buckets.set(identifier, current)
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetAt: current.resetAt,
        retryAfterMs: Math.max(current.resetAt - now, 0),
      }
    }

    const next = { ...current, count: current.count + 1 }
    buckets.set(identifier, next)

    return {
      allowed: true,
      remaining: Math.max(limit - next.count, 0),
      limit,
      resetAt: next.resetAt,
      retryAfterMs: 0,
    }
  }

  function reset(identifier?: string) {
    if (identifier) buckets.delete(identifier)
    else buckets.clear()
  }

  return { check, reset }
}
