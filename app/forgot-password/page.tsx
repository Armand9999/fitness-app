'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { requestPasswordReset } from './action'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter your email and we&apos;ll send you a secure reset link.</p>

        {state?.message && <p role="status" className={`mt-4 rounded-md p-3 text-sm ${state.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>{state.message}</p>}

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state?.errors?.email)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            {state?.errors?.email && <p className="mt-2 text-sm text-red-600" role="alert">{state.errors.email[0]}</p>}
          </div>
          <button type="submit" disabled={pending} className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">{pending ? 'Sending...' : 'Send reset link'}</button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-blue-600 hover:text-blue-500">Back to login</Link>
      </div>
    </div>
  )
}
