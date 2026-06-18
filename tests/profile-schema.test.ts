import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ProfileSchema } from '../app/lib/profile'

const validProfile = {
  age: '30',
  weight_kg: '80.5',
  height_cm: '180.2',
  gender: 'male',
  activity_level: 'moderately_active',
  goal: 'stay_fit',
}

describe('ProfileSchema', () => {
  it('coerces valid form values into a typed profile', () => {
    const result = ProfileSchema.parse(validProfile)

    assert.deepEqual(result, {
      age: 30,
      weight_kg: 80.5,
      height_cm: 180.2,
      gender: 'male',
      activity_level: 'moderately_active',
      goal: 'stay_fit',
    })
  })

  it('enforces the profile form numeric ranges', () => {
    for (const profile of [
      { ...validProfile, age: '0' },
      { ...validProfile, age: '121' },
      { ...validProfile, weight_kg: '19.9' },
      { ...validProfile, weight_kg: '300.1' },
      { ...validProfile, height_cm: '49.9' },
      { ...validProfile, height_cm: '250.1' },
    ]) {
      assert.equal(ProfileSchema.safeParse(profile).success, false)
    }
  })

  it('rejects non-numeric, empty, and fractional age values', () => {
    assert.equal(ProfileSchema.safeParse({ ...validProfile, age: 'not-a-number' }).success, false)
    assert.equal(ProfileSchema.safeParse({ ...validProfile, age: '' }).success, false)
    assert.equal(ProfileSchema.safeParse({ ...validProfile, age: '30.5' }).success, false)
  })

  it('rejects unsupported domain values', () => {
    assert.equal(ProfileSchema.safeParse({ ...validProfile, gender: 'other' }).success, false)
    assert.equal(ProfileSchema.safeParse({ ...validProfile, activity_level: 'sometimes_active' }).success, false)
    assert.equal(ProfileSchema.safeParse({ ...validProfile, goal: 'run_marathon' }).success, false)
  })
})
