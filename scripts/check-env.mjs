#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

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

function loadDotenvFiles() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (existsSync(path)) dotenv.config({ path, override: false })
  }
}

export function getEnvReport(env = process.env) {
  const missingRequired = REQUIRED_ENV_VARS.filter((name) => !env[name])
  const configuredOptional = OPTIONAL_E2E_ENV_VARS.filter((name) => Boolean(env[name]))
  const missingOptional = OPTIONAL_E2E_ENV_VARS.filter((name) => !env[name])

  return {
    ok: missingRequired.length === 0,
    required: REQUIRED_ENV_VARS,
    optional: OPTIONAL_E2E_ENV_VARS,
    missingRequired,
    configuredOptional,
    missingOptional,
  }
}

export function formatReport(report) {
  const lines = [
    report.ok ? 'Environment check passed.' : 'Environment check failed.',
    `Required variables checked: ${report.required.join(', ')}`,
  ]

  if (report.missingRequired.length > 0) {
    lines.push(`Missing required variables: ${report.missingRequired.join(', ')}`)
  }

  lines.push(`Optional E2E variables configured: ${report.configuredOptional.length}/${report.optional.length}`)
  if (report.missingOptional.length > 0) {
    lines.push(`Optional E2E variables not set: ${report.missingOptional.join(', ')}`)
  }

  return lines.join('\n')
}

function main() {
  loadDotenvFiles()
  const report = getEnvReport()
  const output = formatReport(report)

  if (report.ok) {
    console.log(output)
    return
  }

  console.error(output)
  process.exitCode = 1
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectRun) main()
