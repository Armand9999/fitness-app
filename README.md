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

> The database schema and Row Level Security policies are not yet versioned in this repository. Configure Supabase carefully before exposing the application to users. Browser database access relies on correct Row Level Security policies.

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

## Environment Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Supabase anonymous key; requires appropriate Row Level Security |
| `NEXT_PUBLIC_SITE_URL` | Browser and server | Application origin used for authentication redirects |
| `NEXT_APP_OPENAI_API_KEY` | Server only | OpenAI credential used to generate workouts and meal plans |

Never commit `.env.local` or real credentials. The checked-in `.env.example` contains placeholders only.

## Quality Checks

Run the complete local quality gate:

```bash
npm run check
npm run build
```

Or run checks individually:

```bash
npm run lint
npm run typecheck
npm test
```

The test command compiles the selected TypeScript source and tests into the ignored `.test-dist` directory, then runs them with Node's built-in test runner. The baseline suite covers TDEE calculations and authentication schemas.

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

## Current Productionization Status

This repository is being hardened incrementally. The current baseline includes deterministic builds, explicit quality scripts, unit tests for core calculations and authentication validation, and documented environment setup. Upcoming work should version the Supabase schema and policies, strengthen profile validation, validate AI output, and add end-to-end coverage.
