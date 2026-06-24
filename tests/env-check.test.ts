import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { describe, it } from 'node:test'

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-secret-value',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  NEXT_APP_OPENAI_API_KEY: 'openai-secret-value',
}

describe('environment validation script', () => {
  it('passes when required variables are configured without printing values', () => {
    const output = execFileSync('node', ['scripts/check-env.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, ...requiredEnv },
    })

    assert.match(output, /Environment check passed\./)
    assert.match(output, /Required variables checked:/)
    assert.doesNotMatch(output, /anon-secret-value/)
    assert.doesNotMatch(output, /openai-secret-value/)
  })

  it('fails by variable name only when required variables are missing', () => {
    assert.throws(
      () => execFileSync('node', ['scripts/check-env.mjs'], {
        encoding: 'utf8',
        env: {
          ...process.env,
          NEXT_PUBLIC_SUPABASE_URL: requiredEnv.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          NEXT_PUBLIC_SITE_URL: requiredEnv.NEXT_PUBLIC_SITE_URL,
          NEXT_APP_OPENAI_API_KEY: '',
        },
        stdio: 'pipe',
      }),
      (error: unknown) => {
        const output = String((error as { stderr?: Buffer }).stderr)
        assert.match(output, /Environment check failed\./)
        assert.match(output, /NEXT_APP_OPENAI_API_KEY/)
        assert.doesNotMatch(output, /anon-secret-value/)
        return true
      },
    )
  })

  it('documents optional E2E variables as optional', () => {
    const output = execFileSync('node', ['scripts/check-env.mjs'], {
      encoding: 'utf8',
      env: { ...process.env, ...requiredEnv, E2E_AUTH_EMAIL: '', E2E_AUTH_PASSWORD: '', E2E_MOCK_AI: '' },
    })

    assert.match(output, /Optional E2E variables configured: 0\/3/)
    assert.match(output, /Optional E2E variables not set:/)
  })
})
