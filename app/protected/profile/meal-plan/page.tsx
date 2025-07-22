'use client'

import { useEffect, useState } from 'react'
import { getMeal, regenerateMealPlan } from './action'
import Link from 'next/link'

export default function MealPlanPage() {
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const mealPlan = await getMeal()
        setPlan(mealPlan)
      } catch (err) {
        setError('Failed to load meal plan')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newPlan = await regenerateMealPlan()
      setPlan(newPlan)
    } catch (err) {
      setError('Failed to regenerate meal plan')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-pulse text-center">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your meal plan...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="max-w-xl mx-auto p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <p className="text-red-600 dark:text-red-400">{error}</p>
    </div>
  )

  if (!plan) return (
    <div className="max-w-xl mx-auto p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <p className="text-yellow-600 dark:text-yellow-400">No meal plan available.</p>
    </div>
  )

  // Parse meals if it's stored as a JSON string
  const mealsData = typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals
  const meals = mealsData?.Meals || mealsData

  const mealIcons = {
    Breakfast: '🍳',
    Lunch: '🥗', 
    Dinner: '🍽️',
    Snacks: '🍎'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Meal Plan</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {regenerating ? '🔄 Generating...' : '🔄 New Plan'}
          </button>
          <Link 
            href="/protected" 
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">
          <span className="font-medium">Target Calories:</span> {plan.calories_target} kcal
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          Goal: {plan.goal?.replace('_', ' ')}
        </p>
      </div>
      
      <div className="grid gap-4">
        {Object.entries(meals || {}).map(([mealType, mealContent]) => (
          <div key={mealType} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              <span className="mr-2 text-xl">{mealIcons[mealType as keyof typeof mealIcons] || '🍴'}</span>
              {mealType}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {mealContent}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Link 
          href="/protected/profile" 
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Update your profile to customize your meal plan
        </Link>
      </div>
    </div>
  )
}