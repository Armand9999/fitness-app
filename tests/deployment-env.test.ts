import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-secret-value',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  NEXT_APP_OPENAI_API_KEY: 'openai-secret-value',
}

function runEnvCheck(env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, ['scripts/check-env.mjs'], {
    cwd: process.cwd(),
    env: { PATH: process.env.PATH, ...env } as unknown as NodeJS.ProcessEnv,
    encoding: 'utf8',
  })
}

describe('deployment environment validation', () => {
  it('fails closed when required deployment variables are missing', () => {
    const result = runEnvCheck({})
    const payload = JSON.parse(result.stdout)

    assert.equal(result.status, 1)
    assert.equal(payload.status, 'missing_required_environment')
    assert.deepEqual(payload.required.missing, [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_APP_OPENAI_API_KEY',
    ])
  })

  it('passes with required variables and never prints configured secret values', () => {
    const result = runEnvCheck(requiredEnv)
    const payload = JSON.parse(result.stdout)

    assert.equal(result.status, 0)
    assert.equal(payload.status, 'ok')
    assert.deepEqual(payload.required.missing, [])
    assert.deepEqual(payload.optional.missing, ['E2E_AUTH_EMAIL', 'E2E_AUTH_PASSWORD', 'E2E_MOCK_AI'])
    assert.doesNotMatch(result.stdout, /anon-secret-value/)
    assert.doesNotMatch(result.stdout, /openai-secret-value/)
  })

  it('treats E2E variables as optional release checks', () => {
    const result = runEnvCheck({
      ...requiredEnv,
      E2E_AUTH_EMAIL: 'e2e@example.com',
      E2E_AUTH_PASSWORD: 'e2e-secret-value',
      E2E_MOCK_AI: '1',
    })
    const payload = JSON.parse(result.stdout)

    assert.equal(result.status, 0)
    assert.deepEqual(payload.optional.missing, [])
    assert.doesNotMatch(result.stdout, /e2e-secret-value/)
  })

  it('wires env validation into npm scripts and CI', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
    const readme = readFileSync('README.md', 'utf8')

    assert.equal(packageJson.scripts['env:check'], 'node scripts/check-env.mjs')
    assert.match(packageJson.scripts.ci, /npm run env:check/)
    assert.match(workflow, /npm run env:check/)
    assert.match(readme, /Deployment and Release Checklist/)
    assert.match(readme, /Rollback checklist/)
  })
})
