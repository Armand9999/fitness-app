'use client'

import Link from 'next/link'
import { useState } from 'react'

import {
  ACTIVITY_LEVEL_OPTIONS,
  FITNESS_GOAL_OPTIONS,
  GENDER_OPTIONS,
  type ProfileField,
  type ProfileFieldErrors,
} from '@/app/lib/profile-options'
import { createProfile } from './action'

function FieldError({ field, errors }: { field: ProfileField; errors: ProfileFieldErrors }) {
  const message = errors[field]?.[0]

  if (!message) return null

  return <p id={`${field}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
}

export default function ProfileSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({})

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setErrorMessage(null)
    setFieldErrors({})

    try {
      const result = await createProfile(formData)
      if (!result.success) {
        setErrorMessage(result.message)
        setFieldErrors(result.fieldErrors ?? {})
      }
    } catch {
      setErrorMessage('Error creating profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fieldProps = (field: ProfileField) => ({
    'aria-describedby': fieldErrors[field] ? `${field}-error` : undefined,
    'aria-invalid': fieldErrors[field] ? true : undefined,
  })

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set Up Your Profile</h1>
        <Link
          href="/protected"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Back to Dashboard
        </Link>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            min="1"
            max="120"
            required
            {...fieldProps('age')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <FieldError field="age" errors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="20"
            max="300"
            required
            {...fieldProps('weight_kg')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <FieldError field="weight_kg" errors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            min="50"
            max="250"
            required
            {...fieldProps('height_cm')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          />
          <FieldError field="height_cm" errors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
          <select
            id="gender"
            name="gender"
            {...fieldProps('gender')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            {GENDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError field="gender" errors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="activity_level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level</label>
          <select
            id="activity_level"
            name="activity_level"
            {...fieldProps('activity_level')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            {ACTIVITY_LEVEL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError field="activity_level" errors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal</label>
          <select
            id="goal"
            name="goal"
            {...fieldProps('goal')}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            {FITNESS_GOAL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError field="goal" errors={fieldErrors} />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/protected/profile/meal-plan"
            className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Skip for now
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
