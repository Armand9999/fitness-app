import type { GeneratedWorkoutPlan, MealPlanContent } from './generated-plans'

export function isE2EAIMockEnabled() {
  return process.env.E2E_MOCK_AI === '1'
}

export function getMockWorkoutPlan(): GeneratedWorkoutPlan {
  return {
    workout_type: 'full_body',
    difficulty: 'beginner',
    exercises: [
      {
        name: 'E2E Squat to Reach',
        sets: 3,
        reps: '10 reps',
        instructions: 'Stand tall, squat with control, then reach overhead before the next rep.',
        rest: '45 seconds',
      },
      {
        name: 'E2E Incline Push-Up',
        sets: 3,
        reps: '8 reps',
        instructions: 'Place hands on a stable surface and lower your chest with a straight body line.',
        rest: '45 seconds',
      },
    ],
  }
}

export function getMockMealPlanContent(): MealPlanContent {
  return {
    Meals: {
      Breakfast: 'E2E oatmeal with Greek yogurt, berries, and chia seeds.',
      Lunch: 'E2E grilled chicken bowl with quinoa, greens, avocado, and salsa.',
      Dinner: 'E2E salmon plate with roasted sweet potatoes and broccoli.',
      Snacks: 'E2E apple slices with peanut butter and a protein shake.',
    },
  }
}
