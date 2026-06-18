import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { getSafeRedirectPath } from '@/app/lib/auth'
import { logError } from '@/app/lib/logger'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))
  const supabase = await createClient()

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error('Missing authentication callback token') }

  if (!error) redirect(next)

  logError('auth.callback.failed', error, {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
    next,
  })
  redirect('/error')
}
