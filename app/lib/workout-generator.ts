'use server'

import OpenAI from 'openai'

import { parseDateKey } from '@/app/lib/date'
import { GeneratedWorkoutPlanSchema, WorkoutDurationSchema, parseGeneratedContent } from '@/app/lib/generated-plans'
import { ProfileSchema } from '@/app/lib/profile'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 30_000,
})

async function createAndSaveWorkoutPlan(durationInput: number, dateInput: string) {
  const duration = WorkoutDurationSchema.parse(durationInput)
  const date = parseDateKey(dateInput)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profileData) {
    throw new Error('Complete your profile before generating a workout plan')
  }

  const profile = ProfileSchema.parse(profileData)
  const prompt = `Create a personalized ${duration}-minute bodyweight workout plan for a user with goal ${profile.goal}, gender ${profile.gender}, age ${profile.age}, and activity level ${profile.activity_level}. Return a JSON object with workout_type, difficulty, and a non-empty exercises array. Each exercise must include name and instructions, and may include sets, reps, duration, and rest.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const workoutData = parseGeneratedContent(
    response.choices[0]?.message.content,
    GeneratedWorkoutPlanSchema,
  )

  const { data: plan, error } = await supabase
    .from('workout_plans')
    .upsert({
      user_id: user.id,
      date,
      workout_type: workoutData.workout_type,
      duration_minutes: duration,
      difficulty: workoutData.difficulty,
      exercises: workoutData.exercises,
    }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) throw error
  return plan
}

export async function generateWorkoutPlan(duration: number, dateInput: string) {
  const validatedDuration = WorkoutDurationSchema.parse(duration)
  const date = parseDateKey(dateInput)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: existing, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error('Failed to load workout plan')
  if (existing) return existing

  return createAndSaveWorkoutPlan(validatedDuration, date)
}

export async function regenerateWorkoutPlan(duration: number, dateInput: string) {
  try {
    return await createAndSaveWorkoutPlan(duration, parseDateKey(dateInput))
  } catch (error) {
    console.error('Error regenerating workout plan:', error)
    throw new Error('Failed to regenerate workout plan')
  }
}
