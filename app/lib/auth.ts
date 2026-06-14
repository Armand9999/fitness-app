import { z } from 'zod'

export const EmailSchema = z.string().trim().email('Please enter a valid email address.')

export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })

export const PasswordRecoverySchema = z.object({
  email: EmailSchema,
})

export const PasswordResetSchema = z.object({
  password: PasswordSchema,
  confirmPassword: z.string(),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!configuredUrl) throw new Error('NEXT_PUBLIC_SITE_URL is required')

  return new URL(configuredUrl).origin
}

export function getSafeRedirectPath(value: string | null, fallback = '/') {
  return value?.startsWith('/') && !value.startsWith('//') ? value : fallback
}
