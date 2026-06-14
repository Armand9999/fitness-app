import { ACTIVITY_LEVELS, GENDERS, type ActivityLevel, type Gender } from './profile-options'

export interface TDEInput {
  weightKg: number
  heightCm: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

export function calculateTDE({
  weightKg,
  heightCm,
  age,
  gender,
  activityLevel,
}: TDEInput): number {
  if (![weightKg, heightCm, age].every(Number.isFinite) || weightKg <= 0 || heightCm <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive finite numbers')
  }
  if (!GENDERS.includes(gender)) {
    throw new Error('Gender must be either "male" or "female"')
  }
  if (!ACTIVITY_LEVELS.includes(activityLevel)) {
    throw new Error('Invalid activity level')
  }

  const bmr = gender === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  return Math.round(bmr * activityMultipliers[activityLevel])
}
