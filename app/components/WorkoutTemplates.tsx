'use client'

import { useState, useEffect } from 'react'
import { saveWorkoutSession, getTodayWorkoutPlan } from '@/app/lib/client-database'
import { generateWorkoutPlan, regenerateWorkoutPlan } from '@/app/lib/workout-generator'

export default function WorkoutTemplates() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null) 

  useEffect(() => {
    async function loadWorkout() {
      try {
        let plan = await getTodayWorkoutPlan()
        if (!plan) {
          plan = await generateWorkoutPlan(30)
        }
        setWorkoutPlan(plan)
        setError(null) // Clear any previous errors
      } catch (error) {
        console.error('Failed to load workout:', error)
        setError('Failed to load workout. Please try again later.') // Set user-friendly error message
      } finally {
        setLoading(false)
      }
    }
    loadWorkout()
  }, [])

  const handleRegenerate = async () => {
    setRegenerating(true)
    setError(null) 
    try {
      const newPlan = await regenerateWorkoutPlan(30)
      setWorkoutPlan(newPlan)
      setCompletedExercises([])
      setSelectedExercise(null)
    } catch (error) {
      console.error('Failed to regenerate workout:', error)
      setError('Failed to regenerate workout. Please try again later.')
    } finally {
      setRegenerating(false)
    }
  }

  const markComplete = async () => {
    if (!workoutPlan) return
    
    try {
      await saveWorkoutSession({
        name: `${workoutPlan.workout_type} Workout`,
        duration: workoutPlan.duration_minutes,
        exercises: workoutPlan.exercises
      })
      setCompletedExercises(workoutPlan.exercises.map((_: any, idx: number) => idx))
    } catch (error) {
      console.error('Failed to save workout:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Workout</h3>
        <div className="animate-pulse text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">Generating your personalized workout...</p>
        </div>
      </div>
    )
  }

  if (!workoutPlan) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Workout</h3>
        <p className="text-gray-500 dark:text-gray-400">Failed to load workout plan.</p>
      </div>
    )
  }

  const allCompleted = completedExercises.length === workoutPlan.exercises.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today's Workout</h3>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {regenerating ? '🔄 Generating...' : '🔄 New Workout'}
        </button>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-blue-800 dark:text-blue-200">
            <strong>{workoutPlan.workout_type.replace('_', ' ')}</strong> • {workoutPlan.duration_minutes} min
          </span>
          <span className="text-blue-600 dark:text-blue-300 capitalize">{workoutPlan.difficulty}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {workoutPlan.exercises.map((exercise: any, idx: number) => (
          <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {exercise.sets && `${exercise.sets} sets`}
                {exercise.reps && ` × ${exercise.reps}`}
                {exercise.duration && ` • ${exercise.duration}`}
              </div>
            </div>
            
            {selectedExercise === idx ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">{exercise.instructions}</p>
                {exercise.rest && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rest: {exercise.rest}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setCompletedExercises(prev => [...prev, idx])
                      setSelectedExercise(null)
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    ✓ Done
                  </button>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedExercise(idx)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View Details
                </button>
                {completedExercises.includes(idx) && (
                  <span className="text-green-600 dark:text-green-400 text-sm">✓ Done</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {allCompleted && (
        <div className="text-center pt-4">
          <button
            onClick={markComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            🎉 Complete Workout
          </button>
        </div>
      )}
    </div>
  )
}