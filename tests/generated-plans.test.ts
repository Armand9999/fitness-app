import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  GeneratedWorkoutPlanSchema,
  MealPlanContentSchema,
  WorkoutDurationSchema,
  parseGeneratedContent,
  parseMealPlanContent,
} from '../app/lib/generated-plans'

const validWorkout = {
  workout_type: 'strength',
  difficulty: 'beginner',
  exercises: [{ name: 'Squat', sets: 3, reps: '10', instructions: 'Sit back and stand.' }],
}

const validMeals = {
  Meals: {
    Breakfast: 'Oats with berries',
    Lunch: 'Chicken salad',
    Dinner: 'Salmon with rice',
    Snacks: 'Apple and yogurt',
  },
}

describe('generated plan validation', () => {
  it('accepts valid workout plans and meal plans', () => {
    assert.equal(GeneratedWorkoutPlanSchema.parse(validWorkout).workout_type, 'strength')
    assert.equal(MealPlanContentSchema.parse(validMeals).Meals.Lunch, 'Chicken salad')
  })

  it('rejects unsupported workout values and malformed exercises', () => {
    assert.equal(GeneratedWorkoutPlanSchema.safeParse({ ...validWorkout, workout_type: 'dangerous' }).success, false)
    assert.equal(GeneratedWorkoutPlanSchema.safeParse({ ...validWorkout, exercises: [] }).success, false)
    assert.equal(GeneratedWorkoutPlanSchema.safeParse({ ...validWorkout, exercises: [{ name: 'Squat' }] }).success, false)
  })

  it('rejects incomplete or empty meal plans', () => {
    assert.equal(MealPlanContentSchema.safeParse({ Meals: { Breakfast: 'Oats' } }).success, false)
    assert.equal(MealPlanContentSchema.safeParse({ ...validMeals, Meals: { ...validMeals.Meals, Dinner: '' } }).success, false)
  })

  it('validates workout duration bounds', () => {
    assert.equal(WorkoutDurationSchema.parse(30), 30)
    assert.equal(WorkoutDurationSchema.safeParse(9).success, false)
    assert.equal(WorkoutDurationSchema.safeParse(121).success, false)
    assert.equal(WorkoutDurationSchema.safeParse(30.5).success, false)
  })

  it('rejects empty, invalid JSON, and invalid generated structures', () => {
    assert.throws(() => parseGeneratedContent('', GeneratedWorkoutPlanSchema), /no content/)
    assert.throws(() => parseGeneratedContent('{bad json', GeneratedWorkoutPlanSchema), /invalid JSON/)
    assert.throws(() => parseGeneratedContent(JSON.stringify({ workout_type: 'strength' }), GeneratedWorkoutPlanSchema), /invalid plan structure/)
  })

  it('parses validated legacy string meal plans', () => {
    assert.deepEqual(parseMealPlanContent(JSON.stringify(validMeals)), validMeals)
    assert.throws(() => parseMealPlanContent('{bad json'), /invalid JSON/)
  })
})

describe('generation persistence contract', () => {
  it('uses non-destructive upserts for generated plans', async () => {
    const { readFile } = await import('node:fs/promises')
    const workoutSource = await readFile('app/lib/workout-generator.ts', 'utf8')
    const mealSource = await readFile('app/protected/profile/meal-plan/action.ts', 'utf8')

    for (const source of [workoutSource, mealSource]) {
      assert.match(source, /\.upsert\(/)
      assert.doesNotMatch(source, /\.delete\(\)/)
      assert.match(source, /response_format: \{ type: 'json_object' \}/)
    }
  })
})
