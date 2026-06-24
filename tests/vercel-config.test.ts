import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'))
const readme = readFileSync('README.md', 'utf8')
const releaseDoc = readFileSync('docs/release.md', 'utf8')

function configuredHeaders() {
  const [globalHeaderConfig] = vercelConfig.headers
  return new Map(
    globalHeaderConfig.headers.map(({ key, value }: { key: string; value: string }) => [key, value]),
  )
}

describe('Vercel deployment controls', () => {
  it('applies baseline security headers to every route', () => {
    assert.equal(vercelConfig.headers[0].source, '/(.*)')

    const headers = configuredHeaders()
    assert.equal(headers.get('Strict-Transport-Security'), 'max-age=63072000; includeSubDomains')
    assert.equal(headers.get('X-Content-Type-Options'), 'nosniff')
    assert.equal(headers.get('X-Frame-Options'), 'DENY')
    assert.equal(headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
    assert.match(String(headers.get('Permissions-Policy')), /camera=\(\)/)
    assert.match(String(headers.get('Permissions-Policy')), /microphone=\(\)/)
    assert.match(String(headers.get('Permissions-Policy')), /geolocation=\(\)/)
  })

  it('documents Vercel edge controls and release verification', () => {
    assert.match(readme, /Vercel Deployment Controls/)
    assert.match(readme, /Vercel Firewall or WAF rules/)
    assert.match(releaseDoc, /Confirm Vercel Firewall\/WAF rules/)
    assert.match(releaseDoc, /Confirm `vercel\.json` security headers/)
  })
})
