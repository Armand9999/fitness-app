import { z } from 'zod'

import { ACTIVITY_LEVELS, FITNESS_GOALS, GENDERS } from './profile-options'

const numberFromForm = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value)
    }

    return value
  }, schema)

export const ProfileSchema = z.object({
  age: numberFromForm(
    z.number({ invalid_type_error: 'Age must be a valid number.' })
      .int('Age must be a whole number.')
      .min(1, 'Age must be at least 1.')
      .max(120, 'Age must be at most 120.'),
  ),
  weight_kg: numberFromForm(
    z.number({ invalid_type_error: 'Weight must be a valid number.' })
      .min(20, 'Weight must be at least 20 kg.')
      .max(300, 'Weight must be at most 300 kg.'),
  ),
  height_cm: numberFromForm(
    z.number({ invalid_type_error: 'Height must be a valid number.' })
      .min(50, 'Height must be at least 50 cm.')
      .max(250, 'Height must be at most 250 cm.'),
  ),
  gender: z.enum(GENDERS, { message: 'Select a supported gender.' }),
  activity_level: z.enum(ACTIVITY_LEVELS, { message: 'Select a supported activity level.' }),
  goal: z.enum(FITNESS_GOALS, { message: 'Select a supported fitness goal.' }),
})

export type Profile = z.infer<typeof ProfileSchema>
