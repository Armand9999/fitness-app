'use server'

import OpenAI from 'openai'

import { parseDateKey } from '@/app/lib/date'
import { MealPlanContentSchema, parseGeneratedContent } from '@/app/lib/generated-plans'
import { ProfileSchema } from '@/app/lib/profile'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPENAI_API_KEY,
  maxRetries: 1,
  timeout: 30_000,
})

async function createAndSaveMealPlan(dateInput: string) {
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
    throw new Error('Complete your profile before generating a meal plan')
  }
  const profile = ProfileSchema.parse(profileData)

  const { data: tdeEstimate, error: tdeError } = await supabase
    .from('tde_estimates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (tdeError || !tdeEstimate || tdeEstimate.tde_value <= 0) {
    throw new Error('A valid TDEE estimate is required to create a meal plan')
  }

  const prompt = `Create a balanced, realistic one-day meal plan for a user with goal ${profile.goal}, gender ${profile.gender}, weight ${profile.weight_kg} kg, height ${profile.height_cm} cm, activity level ${profile.activity_level}, and TDEE ${tdeEstimate.tde_value} calories. Return a JSON object with a Meals object containing non-empty Breakfast, Lunch, Dinner, and Snacks strings with specific portions.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const meals = parseGeneratedContent(response.choices[0]?.message.content, MealPlanContentSchema)
  const caloriesTarget = profile.goal === 'lose_weight'
    ? tdeEstimate.tde_value - 500
    : profile.goal === 'build_muscle'
      ? tdeEstimate.tde_value + 300
      : tdeEstimate.tde_value

  const { data: mealPlan, error: insertError } = await supabase
    .from('meal_plans')
    .upsert({
      user_id: user.id,
      date,
      goal: profile.goal,
      calories_target: caloriesTarget,
      meals,
    }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (insertError) throw new Error('Error creating meal plan')
  return mealPlan
}

export async function regenerateMealPlan(dateInput: string) {
  try {
    return await createAndSaveMealPlan(dateInput)
  } catch (error) {
    console.error('Meal plan regeneration error:', error)
    throw new Error('Failed to regenerate meal plan')
  }
}

export async function getMeal(dateInput: string) {
  const date = parseDateKey(dateInput)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: mealPlan, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error('Error fetching meal plan')
  if (mealPlan) return mealPlan

  try {
    return await createAndSaveMealPlan(date)
  } catch (generationError) {
    console.error('Meal plan generation error:', generationError)
    throw new Error('Failed to generate meal plan')
  }
}
