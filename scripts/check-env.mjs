#!/usr/bin/env node

export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_APP_OPENAI_API_KEY',
]

export const OPTIONAL_E2E_ENV_VARS = [
  'E2E_AUTH_EMAIL',
  'E2E_AUTH_PASSWORD',
  'E2E_MOCK_AI',
]

export function validateEnvironment(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name])
  const optionalMissing = OPTIONAL_E2E_ENV_VARS.filter((name) => !env[name])

  return {
    ok: missing.length === 0,
    required: {
      expected: REQUIRED_ENV_VARS,
      missing,
      configured: REQUIRED_ENV_VARS.filter((name) => Boolean(env[name])),
    },
    optional: {
      expected: OPTIONAL_E2E_ENV_VARS,
      missing: optionalMissing,
      configured: OPTIONAL_E2E_ENV_VARS.filter((name) => Boolean(env[name])),
    },
  }
}

function run() {
  const result = validateEnvironment()
  const output = {
    status: result.ok ? 'ok' : 'missing_required_environment',
    required: result.required,
    optional: result.optional,
  }

  console.log(JSON.stringify(output, null, 2))

  if (!result.ok) {
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run()
}
