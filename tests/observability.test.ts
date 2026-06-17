import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GET as healthGET } from '../app/api/health/route'
import { GET as readinessGET } from '../app/api/readiness/route'
import { logError, sanitizeLogMeta } from '../app/lib/logger'

describe('observability contracts', () => {
  it('redacts sensitive metadata before logging', () => {
    assert.deepEqual(sanitizeLogMeta({
      authorization: 'Bearer token',
      nested: { apiKey: 'secret-key', safe: 'value' },
      cookie: 'session=value',
    }), {
      authorization: '[REDACTED]',
      nested: { apiKey: '[REDACTED]', safe: 'value' },
      cookie: '[REDACTED]',
    })
  })

  it('emits structured JSON errors without raw sensitive values', () => {
    const originalError = console.error
    const messages: string[] = []
    console.error = (message?: unknown) => { messages.push(String(message)) }

    try {
      logError('test.failure', new Error('Something failed'), {
        password: 'super-secret',
        route: '/protected',
      })
    } finally {
      console.error = originalError
    }

    assert.equal(messages.length, 1)
    const payload = JSON.parse(messages[0])
    assert.equal(payload.level, 'error')
    assert.equal(payload.event, 'test.failure')
    assert.equal(payload.password, '[REDACTED]')
    assert.equal(payload.route, '/protected')
    assert.equal(payload.error.message, 'Something failed')
    assert.doesNotMatch(messages[0], /super-secret/)
  })

  it('returns a non-sensitive health payload', async () => {
    const response = healthGET()
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
    assert.equal(body.service, 'fitness-app')
    assert.equal(typeof body.timestamp, 'string')
  })

  it('reports readiness by variable names without exposing values', async () => {
    const previous = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_APP_OPENAI_API_KEY: process.env.NEXT_APP_OPENAI_API_KEY,
    }

    try {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-secret-value'
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
      delete process.env.NEXT_APP_OPENAI_API_KEY

      const response = readinessGET()
      const body = await response.json()

      assert.equal(response.status, 503)
      assert.equal(body.status, 'not_ready')
      assert.deepEqual(body.missing, ['NEXT_APP_OPENAI_API_KEY'])
      assert.doesNotMatch(JSON.stringify(body), /anon-secret-value/)
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
  })
})
