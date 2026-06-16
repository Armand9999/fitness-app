'use server'

import { PasswordResetSchema } from '@/app/lib/auth'
import { createClient } from '@/utils/supabase/server'

export type PasswordResetState = {
  success?: boolean
  message?: string
  errors?: { password?: string[]; confirmPassword?: string[] }
} | undefined

export async function updatePassword(
  _state: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const parsed = PasswordResetSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { message: 'This password reset link is invalid or has expired. Request a new link.' }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    console.error('Password update failed:', error.message)
    return { message: 'We could not update your password. Request a new reset link and try again.' }
  }

  await supabase.auth.signOut()
  return { success: true, message: 'Your password has been updated. You can now log in.' }
}
