import { z } from 'zod'

export const WORKOUT_TYPES = ['cardio', 'strength', 'full_body', 'flexibility'] as const
export const WORKOUT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

const boundedText = (field: string, max: number) =>
  z.string().trim().min(1, `${field} is required.`).max(max, `${field} is too long.`)

export const WorkoutDurationSchema = z.number()
  .int('Workout duration must be a whole number.')
  .min(10, 'Workout duration must be at least 10 minutes.')
  .max(120, 'Workout duration must be at most 120 minutes.')

export const ExerciseSchema = z.object({
  name: boundedText('Exercise name', 120),
  sets: z.number().int().min(1).max(20).optional(),
  reps: boundedText('Exercise reps', 60).optional(),
  duration: boundedText('Exercise duration', 60).optional(),
  instructions: boundedText('Exercise instructions', 600),
  rest: boundedText('Exercise rest', 60).optional(),
}).strict()

export const GeneratedWorkoutPlanSchema = z.object({
  workout_type: z.enum(WORKOUT_TYPES),
  difficulty: z.enum(WORKOUT_DIFFICULTIES),
  exercises: z.array(ExerciseSchema).min(1).max(30),
}).strict()

export const MealPlanContentSchema = z.object({
  Meals: z.object({
    Breakfast: boundedText('Breakfast', 1000),
    Lunch: boundedText('Lunch', 1000),
    Dinner: boundedText('Dinner', 1000),
    Snacks: boundedText('Snacks', 1000),
  }).strict(),
}).strict()

export type GeneratedWorkoutPlan = z.infer<typeof GeneratedWorkoutPlanSchema>
export type MealPlanContent = z.infer<typeof MealPlanContentSchema>

export function parseGeneratedContent<T>(content: string | null | undefined, schema: z.ZodType<T>): T {
  if (!content?.trim()) {
    throw new Error('Generation returned no content')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Generation returned invalid JSON')
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new Error('Generation returned an invalid plan structure')
  }

  return result.data
}

export function parseMealPlanContent(value: unknown): MealPlanContent {
  const parsed = typeof value === 'string'
    ? parseGeneratedContent(value, MealPlanContentSchema)
    : MealPlanContentSchema.parse(value)

  return parsed
}
