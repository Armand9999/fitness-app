'use client'

import { useState } from 'react'
import Link from 'next/link'
import WaterTracker from '../components/WaterTracker'
import WorkoutTemplates from '../components/WorkoutTemplates'
import WeeklyProgress from '../components/WeeklyProgress'

export default function ProtectedPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-[80vh]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Track your fitness progress and manage your workouts
        </p>
      </div>

      {/* Dashboard tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`${
              activeTab === 'workouts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`${
              activeTab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Progress
          </button>
          <Link
            href="/protected/profile/meal-plan"
            className="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
          >
            Meal Plan
          </Link>
          <button
            onClick={() => setActiveTab('settings')}
            className={`${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today's Goal</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">30 minutes cardio</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/protected/profile/meal-plan" className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Meal Plan</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">View your personalized meal plan</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/protected/profile" className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Update your fitness profile</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <WaterTracker />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <WorkoutTemplates />
              </div>
              
              <WeeklyProgress />
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <WorkoutTemplates />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Progress Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400">Progress charts coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h3>
              <div className="space-y-4">
                <Link 
                  href="/protected/profile" 
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-2">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Update Profile</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your fitness profile information</p>
                  </div>
                  <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link 
                  href="/protected/profile/meal-plan" 
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Meal Preferences</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customize your meal plan settings</p>
                  </div>
                  <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}