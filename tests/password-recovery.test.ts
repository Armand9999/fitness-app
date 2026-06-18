import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { PasswordRecoverySchema, PasswordResetSchema, getSafeRedirectPath } from '../app/lib/auth'

describe('password recovery validation', () => {
  it('validates and normalizes recovery email addresses', () => {
    assert.equal(PasswordRecoverySchema.parse({ email: ' USER@example.com ' }).email, 'USER@example.com')
    assert.equal(PasswordRecoverySchema.safeParse({ email: 'invalid' }).success, false)
  })

  it('requires a strong matching replacement password', () => {
    assert.equal(PasswordResetSchema.safeParse({ password: 'Strong1!', confirmPassword: 'Strong1!' }).success, true)
    assert.equal(PasswordResetSchema.safeParse({ password: 'weak', confirmPassword: 'weak' }).success, false)
    assert.equal(PasswordResetSchema.safeParse({ password: 'Strong1!', confirmPassword: 'Different1!' }).success, false)
  })

  it('allows only local callback redirect paths', () => {
    assert.equal(getSafeRedirectPath('/reset-password'), '/reset-password')
    assert.equal(getSafeRedirectPath('https://attacker.example'), '/')
    assert.equal(getSafeRedirectPath('//attacker.example'), '/')
    assert.equal(getSafeRedirectPath(null, '/login'), '/login')
  })
})

describe('password recovery flow contract', () => {
  it('uses the recovery callback and avoids account enumeration', () => {
    const requestAction = readFileSync('app/forgot-password/action.ts', 'utf8')
    const resetAction = readFileSync('app/reset-password/action.ts', 'utf8')
    const callback = readFileSync('app/auth/confirm/route.ts', 'utf8')

    assert.match(requestAction, /resetPasswordForEmail/)
    assert.match(requestAction, /auth\/confirm\?next=\/reset-password/)
    assert.match(requestAction, /If an account exists for that email/)
    assert.match(resetAction, /auth\.updateUser\(\{ password:/)
    assert.match(resetAction, /auth\.signOut\(\)/)
    assert.match(callback, /getSafeRedirectPath/)
    assert.match(callback, /exchangeCodeForSession/)
    assert.match(callback, /verifyOtp/)
  })
})
