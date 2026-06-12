import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LoginSchema, SignUpSchema } from '../app/lib/definitions'

describe('SignUpSchema', () => {
  it('accepts and trims valid signup data', () => {
    const result = SignUpSchema.safeParse({
      name: '  Taylor  ',
      email: '  taylor@example.com  ',
      password: 'Strong1!',
    })

    assert.equal(result.success, true)
    if (result.success) {
      assert.deepEqual(result.data, {
        name: 'Taylor',
        email: 'taylor@example.com',
        password: 'Strong1!',
      })
    }
  })

  it('rejects weak passwords and invalid identity fields', () => {
    const result = SignUpSchema.safeParse({
      name: 'A',
      email: 'not-an-email',
      password: 'password',
    })

    assert.equal(result.success, false)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      assert.ok(errors.name)
      assert.ok(errors.email)
      assert.ok(errors.password)
    }
  })
})

describe('LoginSchema', () => {
  it('accepts and trims valid login data', () => {
    const result = LoginSchema.safeParse({
      email: '  taylor@example.com  ',
      password: '  Strong1!  ',
    })

    assert.equal(result.success, true)
    if (result.success) {
      assert.deepEqual(result.data, {
        email: 'taylor@example.com',
        password: 'Strong1!',
      })
    }
  })

  it('rejects invalid email addresses', () => {
    const result = LoginSchema.safeParse({
      email: 'invalid',
      password: 'Strong1!',
    })

    assert.equal(result.success, false)
    if (!result.success) {
      assert.ok(result.error.flatten().fieldErrors.email)
    }
  })
})
