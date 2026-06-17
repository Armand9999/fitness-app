# FitTrack Pro

FitTrack Pro is a Next.js fitness tracking application that combines Supabase authentication and persistence with AI-generated workout and meal plans.

## Features

- Email and password authentication with email verification
- Fitness profile and TDEE calculation
- Daily water intake tracking
- Personalized workout generation and completed-workout tracking
- Personalized daily meal-plan generation
- Weekly progress summaries

## Tech Stack

- Next.js 15, React 19, and TypeScript
- Tailwind CSS 4
- Supabase Authentication, Database, and Realtime
- OpenAI API
- Node.js built-in test runner

## Prerequisites

- Node.js 20 or newer
- A Supabase project with the tables expected by the application
- An OpenAI API key for workout and meal-plan generation

The versioned Supabase schema in `supabase/migrations` defines the application tables, constraints, indexes, and Row Level Security policies. Browser database access relies on those policies being applied to every environment.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the documented template:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with your Supabase project values, application URL, and server-only OpenAI API key.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

### Windows PowerShell note

If you are using PowerShell, create `.env.local` with the examples above and run the mocked E2E command like this:

```powershell
$env:E2E_MOCK_AI = "1"
npm run test:e2e
```

## Environment Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Supabase anonymous key; requires appropriate Row Level Security |
| `NEXT_PUBLIC_SITE_URL` | Browser and server | Application origin used for authentication redirects |
| `NEXT_APP_OPENAI_API_KEY` | Server only | OpenAI credential used to generate workouts and meal plans |
| `E2E_AUTH_EMAIL` | Local/CI test runner only | Optional dedicated Supabase test-user email for authenticated Playwright flows |
| `E2E_AUTH_PASSWORD` | Local/CI test runner only | Optional dedicated Supabase test-user password for authenticated Playwright flows |
| `E2E_MOCK_AI` | Local/CI test runner only | Set to `1` to make authenticated generation E2E tests use deterministic workout and meal-plan fixtures instead of OpenAI |

Never commit `.env.local` or real credentials. The checked-in `.env.example` contains placeholders only.

## Authentication Redirects

Add the deployed application origin and `/auth/confirm` callback to the Supabase Authentication URL configuration. Password recovery sends users through `/auth/confirm?next=/reset-password`; the callback verifies either PKCE codes or email OTP token hashes and only permits local redirect paths.

## Supabase Database

The `supabase` directory contains the local project configuration and versioned database migrations. The empty `20260611155633_remote_baseline.sql` marker represents the existing dashboard-managed schema already recorded remotely. The following reconciliation migration safely hardens those existing tables, preserves `food_logs`, enables consistent Row Level Security, prevents duplicate daily records, and defines the atomic `save_profile_with_tde` database function.

Before applying the reconciliation migration, run `supabase/preflight/20260611170000_reconcile_fitness_schema.sql` in the linked project and verify every query returns no rows. Do not restore or push the removed empty-database initial migration against the existing project.

Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started). This migration history is currently based on an existing dashboard-managed project: the empty baseline marker aligns remote history, while the reconciliation migration assumes the existing tables are present. Do not run `supabase db reset` against this history until the committed remote schema snapshot has been promoted into a reproducible baseline migration.

After reviewing the pending reconciliation migration, inspect and apply it to the linked remote project with:

```bash
supabase link --project-ref <project-ref>
supabase migration list --linked
supabase db push --dry-run
supabase db push
```

After changing the database schema, generate a temporary contract from the linked project and compare it with the checked-in TypeScript database contract:

```bash
supabase gen types typescript --linked > supabase/remote-database.types.ts
```

Windows PowerShell 5.1 writes redirected output as UTF-16, which causes ESLint to report that the generated TypeScript file appears to be binary. Use an explicit UTF-8 encoding instead:

```powershell
npx supabase gen types typescript --linked | Out-File -Encoding utf8 supabase/remote-database.types.ts
```

The temporary `supabase/remote-database.types.ts` comparison artifact is ignored by Git and ESLint. The checked-in database types intentionally include more specific JSON-column shapes used by the current application, so review regenerated JSON fields before replacing `app/lib/database.types.ts` and keep application validation aligned with the database contract.

## Quality Checks

Run the complete local quality gate:

```bash
npm run check
npm run build
npm run test:e2e
```

Windows PowerShell users can set the mocked E2E environment variable directly and then run Playwright:

```powershell
$env:E2E_MOCK_AI = "1"
npm run test:e2e
```

Or run checks individually:

```bash
npm run lint
npm run typecheck
npm test
```

The test command compiles the selected TypeScript source and tests into the ignored `.test-dist` directory, then runs them with Node's built-in test runner. The baseline suite covers authentication and profile schemas, TDEE calculations, generated workout and meal-plan validation, Supabase client contracts, and the required migration contract.

Playwright always runs the public authentication journeys. Authenticated protected-flow tests are included automatically only when both `E2E_AUTH_EMAIL` and `E2E_AUTH_PASSWORD` are set. Use a dedicated non-production Supabase user, keep those values in `.env.local` or CI secrets, and never commit real credentials. The authenticated setup stores browser state under the ignored `playwright/.auth/` directory. Set `E2E_MOCK_AI=1` with the authenticated credentials to run deterministic meal-plan and workout-generation E2E coverage without making real OpenAI requests.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start a previously built production application |
| `npm run lint` | Lint the repository with ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm test` | Compile and run the baseline unit tests |
| `npm run check` | Run lint, type-checking, and unit tests |
| `npm run test:e2e` | Run Playwright public journeys and, when E2E credentials are configured, authenticated protected-flow checks in Chromium |
| `npm run ci` | Run checks, production build, and end-to-end tests |

## Current Productionization Status

This repository is being hardened incrementally. The current baseline includes deterministic builds, explicit quality scripts, validated authentication recovery, profile and TDEE domains, user-local daily tracking, versioned Supabase schema and Row Level Security policies, and documented environment setup. AI-generated workout and meal-plan output is now validated before persistence and regeneration is non-destructive. Public authentication journeys run in CI, authenticated Supabase protected-flow smoke tests run whenever dedicated E2E credentials are configured, and deterministic mocked-AI E2E coverage verifies generated workout and meal-plan persistence without spending model tokens. Upcoming work should introduce production observability and automated deployment controls.
