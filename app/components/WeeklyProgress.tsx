'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getWeekDates } from '@/app/hooks/useWeekDates'

interface WeekData {
  workoutsCompleted: number
  waterGoalDays: number
  mealPlansFollowed: number
}

export default function WeeklyProgress() {
  const [weekData, setWeekData] = useState<WeekData>({
    workoutsCompleted: 0,
    waterGoalDays: 0,
    mealPlansFollowed: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeeklyData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { weekStart, weekEnd } = getWeekDates()

      // Get workouts this week
      const { data: workouts, error: workoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekStart.toISOString())
        .lte('completed_at', weekEnd.toISOString())

      // Get water intake this week
      const { data: waterIntake, error: waterError } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])

      // Get meal plans followed this week
      const { data: mealPlans, error: mealError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])

      if (workoutsError || waterError || mealError) {
        setError('Failed to load some weekly data.')
        console.error('Weekly data errors:', { workoutsError, waterError, mealError })
      }

      // Calculate water goals achieved (counting multiples)
      const waterGoalCount = waterIntake?.reduce((total, day) => {
        // Calculate how many times the goal was met
        const goalsMet = Math.floor(day.glasses_consumed / day.goal)
        return total + goalsMet
      }, 0) || 0

      setWeekData({
        workoutsCompleted: workouts?.length || 0,
        waterGoalDays: waterGoalCount,
        mealPlansFollowed: mealPlans?.length || 0,
      })
    } catch (error) {
      setError('Failed to load weekly data.')
      console.error('Failed to load weekly data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeeklyData()

    // Set up real-time subscriptions
    const supabase = createClient()

    // Subscribe to workout_sessions changes
    const workoutsSubscription = supabase
      .channel('workout_sessions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workout_sessions',
      }, () => loadWeeklyData())
      .subscribe()

    // Subscribe to water_intake changes
    const waterSubscription = supabase
      .channel('water_intake_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'water_intake',
      }, () => loadWeeklyData())
      .subscribe()

    // Subscribe to meal_plans changes
    const mealSubscription = supabase
      .channel('meal_plans_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meal_plans',
      }, () => loadWeeklyData())
      .subscribe()

    // Refresh data every 5 minutes
    const intervalId = setInterval(() => {
      loadWeeklyData()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(intervalId)
      workoutsSubscription.unsubscribe()
      waterSubscription.unsubscribe()
      mealSubscription.unsubscribe()
    }
  }, [loadWeeklyData])

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">This Week's Progress</h3>
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading"></div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4" role="alert">
          {error}
        </div>
      )}

      <p>Here&#39;s your weekly progress!</p>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {weekData.workoutsCompleted}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Workouts</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {weekData.waterGoalDays}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Water Goals Met</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {weekData.mealPlansFollowed}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Meal Plans</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Keep it up! &quot;💪&quot;
        </div>
      </div>
    </div>
  )
}
