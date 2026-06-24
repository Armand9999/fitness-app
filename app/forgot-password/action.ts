'use server'

import { PasswordRecoverySchema, getSiteUrl } from '@/app/lib/auth'
import { logError } from '@/app/lib/logger'
import { createClient } from '@/utils/supabase/server'

export type PasswordRecoveryState = {
  success?: boolean
  message?: string
  errors?: { email?: string[] }
} | undefined

export async function requestPasswordReset(
  _state: PasswordRecoveryState,
  formData: FormData,
): Promise<PasswordRecoveryState> {
  const parsed = PasswordRecoverySchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`,
  })

  if (error) logError('password_recovery.request.failed', error, { emailSubmitted: true })

  return {
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.',
  }
}
