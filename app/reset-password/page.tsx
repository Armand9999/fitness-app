'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { updatePassword } from './action'

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a new password</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Use at least eight characters with uppercase, lowercase, number, and special character.</p>

        {state?.message && <p role="status" className={`mt-4 rounded-md p-3 text-sm ${state.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>{state.message}</p>}

        {state?.success ? (
          <Link href="/login" className="mt-6 flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Continue to login</Link>
        ) : (
          <form action={action} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required aria-invalid={Boolean(state?.errors?.password)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {state?.errors?.password && <p className="mt-2 text-sm text-red-600" role="alert">{state.errors.password[0]}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm new password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required aria-invalid={Boolean(state?.errors?.confirmPassword)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              {state?.errors?.confirmPassword && <p className="mt-2 text-sm text-red-600" role="alert">{state.errors.confirmPassword[0]}</p>}
            </div>
            <button type="submit" disabled={pending} className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">{pending ? 'Updating...' : 'Update password'}</button>
          </form>
        )}

        {!state?.success && <Link href="/forgot-password" className="mt-6 block text-center text-sm font-medium text-blue-600 hover:text-blue-500">Request a new reset link</Link>}
      </div>
    </div>
  )
}
