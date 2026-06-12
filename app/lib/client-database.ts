'use client'

import { createClient } from "@/utils/supabase/client"

export async function updateWaterIntake(glasses: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('water_intake')
    .upsert(
      { user_id: user.id, date: today, glasses_consumed: glasses },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getWaterIntake(date?: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', targetDate)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  
  return data
}

export async function saveWorkoutSession(workout: {
  name: string
  duration: number
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: string;
    duration?: string;
    instructions: string;
    rest?: string;
  }>
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      workout_name: workout.name,
      duration_minutes: workout.duration,
      exercises: workout.exercises
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTodayWorkoutPlan() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}