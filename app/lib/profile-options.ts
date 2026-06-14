export const GENDERS = ['male', 'female'] as const
export const ACTIVITY_LEVELS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extra_active',
] as const
export const FITNESS_GOALS = ['lose_weight', 'build_muscle', 'stay_fit'] as const

export type Gender = (typeof GENDERS)[number]
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]
export type FitnessGoal = (typeof FITNESS_GOALS)[number]
export type ProfileField = 'age' | 'weight_kg' | 'height_cm' | 'gender' | 'activity_level' | 'goal'
export type ProfileFieldErrors = Partial<Record<ProfileField, string[]>>

export const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export const ACTIVITY_LEVEL_OPTIONS: ReadonlyArray<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
  { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
  { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
  { value: 'extra_active', label: 'Extra Active (very hard exercise & physical job)' },
]

export const FITNESS_GOAL_OPTIONS: ReadonlyArray<{ value: FitnessGoal; label: string }> = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'stay_fit', label: 'Stay Fit' },
]
