'use client'

import { useState } from "react"
import { createProfile } from "./action"
import Link from "next/link"

export default function ProfileSetup() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setError(null)
        setSuccess(false)
        try {
            const result = await createProfile(formData)
            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (error) {
            setError("Error creating profile. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

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
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center justify-between">
                    <span>Profile updated successfully!</span>
                    <Link 
                        href="/protected/profile/meal-plan" 
                        className="text-sm font-medium text-green-700 hover:text-green-600 underline"
                    >
                        View your meal plan
                    </Link>
                </div>
            )}
            
            <form action={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                    <input 
                        name="age" 
                        type="number" 
                        min="1" 
                        max="120" 
                        required 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                    <input 
                        name="weight_kg" 
                        type="number" 
                        step="0.1" 
                        min="20" 
                        max="300" 
                        required 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                    <input 
                        name="height_cm" 
                        type="number" 
                        step="0.1" 
                        min="50" 
                        max="250" 
                        required 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                    <select 
                        name="gender" 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activity Level</label>
                    <select 
                        name="activity_level" 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="sedentary">Sedentary (little or no exercise)</option>
                        <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                        <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                        <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                        <option value="extra_active">Extra Active (very hard exercise & physical job)</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal</label>
                    <select 
                        name="goal" 
                        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="lose_weight">Lose Weight</option>
                        <option value="build_muscle">Build Muscle</option>
                        <option value="stay_fit">Stay Fit</option>
                    </select>
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
                        className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
                            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    )
}