import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const workflow = readFileSync('.github/workflows/quality.yml', 'utf8')
const playwrightConfig = readFileSync('playwright.config.ts', 'utf8')
const publicAuthSpec = readFileSync('e2e/public-auth.spec.ts', 'utf8')
const middlewareHelper = readFileSync('utils/supabase/middleware.ts', 'utf8')
const middleware = readFileSync('middleware.ts', 'utf8')

describe('end-to-end harness contract', () => {
  it('defines deterministic Playwright scripts and failure artifacts', () => {
    assert.equal(packageJson.scripts['test:e2e'], 'playwright test')
    assert.match(playwrightConfig, /screenshot: 'only-on-failure'/)
    assert.match(playwrightConfig, /trace: 'on-first-retry'/)
    assert.match(playwrightConfig, /video: 'retain-on-failure'/)
  })

  it('covers public authentication journeys without real credentials', () => {
    for (const path of ['/', '/login', '/signup', '/reset-password']) {
      assert.match(publicAuthSpec, new RegExp(path.replace('/', '\\/')))
    }
    assert.doesNotMatch(publicAuthSpec, /process\.env\.(?:E2E|TEST)_/)
  })

  it('runs checks, build, and Playwright in CI and uploads failures', () => {
    assert.match(workflow, /npm run check/)
    assert.match(workflow, /npm run build/)
    assert.match(workflow, /npm run test:e2e/)
    assert.match(workflow, /actions\/upload-artifact@v4/)
  })

  it('keeps public routes available without remote auth checks and fails protected routes closed', () => {
    assert.match(middlewareHelper, /if \(!requiresAuthentication && !redirectsAuthenticatedUser\)/)
    assert.match(middlewareHelper, /redirectsAuthenticatedUser && !hasAuthCookie/)
    assert.match(middleware, /pathname\.startsWith\("\/protected"\)/)
    assert.match(middleware, /NextResponse\.redirect\(new URL\("\/login"/)
  })
})
