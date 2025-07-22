'use client'

import { useState, useEffect } from 'react'
import { saveWorkoutSession, getTodayWorkoutPlan } from '@/app/lib/client-database'
import { generateWorkoutPlan, regenerateWorkoutPlan } from '@/app/lib/workout-generator'

type Exercise = {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  instructions: string;
  rest?: string;
}

type WorkoutPlan = {
  workout_type: string;
  duration_minutes: number;
  difficulty: string;
  exercises: Exercise[];
}

export default function WorkoutTemplates() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null)
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

  const [saving, setSaving] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const markComplete = async () => {
    if (!workoutPlan) return
    
    setSaving(true)
    try {
      await saveWorkoutSession({
        name: `${workoutPlan.workout_type} Workout`,
        duration: workoutPlan.duration_minutes,
        exercises: workoutPlan.exercises
      })
      setCompletedExercises(workoutPlan.exercises.map((_: Exercise, idx: number) => idx))
      setShowConfirmation(true)
    } catch (error) {
      console.error('Failed to save workout:', error)
      setError('Failed to save your workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today&apos;s Workout</h3>
        <div className="animate-pulse space-y-4 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
          <div className="text-center mt-2">
            <p className="text-gray-600 dark:text-gray-300">Generating your personalized workout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workoutPlan) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today&apos;s Workout</h3>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error || "Failed to load workout plan."}</p>
          <button
            onClick={handleRegenerate}
            className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            disabled={regenerating}
          >
            {regenerating ? "Trying again..." : "Try Again"}
          </button>
        </div>
      </div>
    )
  }

  const allCompleted = completedExercises.length === workoutPlan.exercises.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today&apos;s Workout</h3>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {regenerating ? "🔄 Generating..." : "🔄 New Workout"}
        </button>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-blue-800 dark:text-blue-200">
            <strong>{workoutPlan.workout_type.replace('_', ' ')}</strong> • {workoutPlan.duration_minutes} min
          </span>
          <span className="text-blue-600 dark:text-blue-300 capitalize">{workoutPlan.difficulty}</span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${(completedExercises.length / workoutPlan.exercises.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{completedExercises.length} of {workoutPlan.exercises.length} completed</span>
            <span>{Math.round((completedExercises.length / workoutPlan.exercises.length) * 100)}%</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {workoutPlan.exercises.map((exercise: Exercise, idx: number) => (
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
      
      {allCompleted ? (
        <div className="text-center pt-4">
          <button
            onClick={markComplete}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "🎉 Complete Workout"}
          </button>
        </div>
      ) : (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Complete all exercises to finish your workout
          </p>
        </div>
      )}
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Workout Completed!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Great job! Your workout has been saved.</p>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}