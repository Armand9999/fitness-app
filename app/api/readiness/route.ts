import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_APP_OPENAI_API_KEY',
] as const

export function GET() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  const ready = missing.length === 0

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      service: 'fitness-app',
      checks: {
        env: ready ? 'ok' : 'missing_required_variables',
      },
      missing,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  )
}
