'use client'

import { useState, useEffect, useCallback } from 'react'
import { updateWaterIntake, getWaterIntake } from '@/app/lib/client-database'

export default function WaterTracker() {
  const [glasses, setGlasses] = useState<number>(0)
  const [goal] = useState<number>(8) // 8 glasses per day
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWaterIntake() {
      try {
        setError(null) 
        const data = await getWaterIntake()
        setGlasses(data?.glasses_consumed || 0)
      } catch (err) {
        console.error('Failed to load water intake:', err)
        setError(err instanceof Error ? err.message : 'Failed to load water data')
      }
    }
    loadWaterIntake()
  }, [])

  const updateWater = useCallback(async (change: number) => {
    const newGlasses = Math.max(0, glasses + change)
    setGlasses(newGlasses)
    
    try {
      const result = await updateWaterIntake(newGlasses)

      console.log(`Water intake updated: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Failed to update water intake:', error)
    }
  }, [glasses])

  const percentage = Math.min((glasses / goal) * 100, 100)

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center" aria-label="Water Intake">
          💧 Water Intake
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
          {glasses}/{goal} glasses
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => updateWater(-1)}
          aria-label="Decrease water intake"
          className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        >
          -
        </button>
        <span className="text-2xl font-bold text-gray-900 dark:text-white" aria-live="polite">
          {glasses}
        </span>
        <button
          onClick={() => updateWater(1)}
          aria-label="Increase water intake"
          className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          +
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2 flex items-center justify-between" role="alert">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="text-blue-500 hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
