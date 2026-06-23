import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const releaseDoc = readFileSync('docs/release.md', 'utf8')
const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

describe('release controls contract', () => {
  it('documents deployment, smoke, migration, and rollback controls', () => {
    for (const phrase of [
      'npm run env:check',
      'supabase db push --dry-run',
      'GET /api/health',
      'GET /api/readiness',
      'Rollback plan',
    ]) {
      assert.ok(releaseDoc.includes(phrase), `Expected release doc to include ${phrase}`)
    }
  })

  it('wires env validation into package scripts and CI without printing secrets', () => {
    assert.equal(packageJson.scripts['env:check'], 'node scripts/check-env.mjs')
    assert.match(workflow, /npm run env:check/)
    assert.doesNotMatch(workflow, /anon-secret-value|openai-secret-value/)
  })
})
