'use server'

import { createClient } from "@/utils/supabase/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.NEXT_APP_OPENAI_API_KEY,
})

export async function generateWorkoutPlan(duration: number = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  
  const today = new Date().toISOString().split('T')[0]
  
  // Check if workout already exists for today
  const { data: existing } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()
  
  if (existing) return existing
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  const prompt = `Create a personalized ${duration}-minute workout plan based on:

User Profile:
- Goal: ${profile?.goal || 'stay_fit'}
- Gender: ${profile?.gender || 'male'}
- Age: ${profile?.age || 30}
- Activity Level: ${profile?.activity_level || 'moderately_active'}

Return ONLY a valid JSON object:
{
  "workout_type": "cardio|strength|full_body|flexibility",
  "difficulty": "beginner|intermediate|advanced",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "10-12",
      "duration": "30 seconds",
      "rest": "30 seconds",
      "instructions": "Brief how-to"
    }
  ]
}

Make it bodyweight-only, realistic for the duration, and match the user's fitness goal.`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "text" },
      temperature: 0.7
    })

    const workoutData = JSON.parse(response.choices[0].message.content!)

    console.log('Generated workout data:', workoutData)
    
    const { data: newPlan, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        date: today,
        workout_type: workoutData.workout_type,
        duration_minutes: duration,
        difficulty: workoutData.difficulty,
        exercises: workoutData.exercises
      })
      .select()
      .single()
    
    if (error) throw error
    return newPlan
  } catch (error) {
    console.error('Error generating workout plan:', error)
    throw new Error('Failed to generate workout plan')
  }
}

export async function regenerateWorkoutPlan(duration: number = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')
  
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // Delete existing plan
    await supabase
      .from('workout_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('date', today)
    
    return await generateWorkoutPlan(duration)
  } catch (error) {
    console.error('Error regenerating workout plan:', error)
    throw new Error('Failed to regenerate workout plan')
  }
}