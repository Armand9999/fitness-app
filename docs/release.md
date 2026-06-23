# Release and Deployment Checklist

Use this checklist for every production release. Keep the application deploy and the Supabase migration deploy coordinated, observable, and reversible.

## 1. Pre-release validation

- Confirm the release branch is up to date with the intended base branch.
- Run `npm ci` on a clean checkout.
- Run `npm run env:check` with production-equivalent variables configured.
- Run `npm run check`.
- Run `npm run build`.
- Run `npm run test:e2e` with `E2E_AUTH_EMAIL`, `E2E_AUTH_PASSWORD`, and `E2E_MOCK_AI=1` when authenticated E2E credentials are available.

## 2. Supabase migration checklist

- Confirm you are linked to the correct Supabase project.
- Run the preflight SQL in `supabase/preflight/20260611170000_reconcile_fitness_schema.sql` and verify every query returns no rows.
- Run `supabase migration list --linked` and confirm local and remote history are aligned.
- Run `supabase db push --dry-run` and inspect the planned SQL.
- Apply with `supabase db push` only after the dry run matches expectations.
- Regenerate a temporary schema contract and compare it with `app/lib/database.types.ts` before committing any type changes.

## 3. CI and secret checklist

Required production secrets/environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_APP_OPENAI_API_KEY`

Optional E2E secrets/environment variables:

- `E2E_AUTH_EMAIL`
- `E2E_AUTH_PASSWORD`
- `E2E_MOCK_AI=1`

Do not print secret values in CI logs. The `env:check` command reports variable names only.

## 4. Deploy

- Deploy the application through the hosting provider after CI passes.
- Keep the previous deployment available until smoke checks pass.
- Do not rotate secrets during the deploy unless the release explicitly requires it.

## 5. Post-deploy smoke checks

- Check `GET /api/health` returns `200` and `status: ok`.
- Check `GET /api/readiness` returns `200` and `status: ready`.
- Sign in with a non-production test user if available.
- Open `/protected` and verify the dashboard loads.
- Open `/protected/profile` and verify the profile form loads.
- Generate or regenerate meal/workout plans only with a safe test user.
- Verify repeated generation attempts produce generic user-facing errors and structured `generation.rate_limited` warnings instead of model calls.
- Watch structured logs for `*.failed` events, `generation.rate_limited` events, and unexpected readiness failures.

## 6. Rollback plan

- If the app deploy fails before migrations are applied, roll back to the previous app deployment.
- If the app deploy fails after a backward-compatible migration, roll back the app first and leave the migration in place.
- If a migration causes data or RLS issues, stop traffic if possible, preserve logs, and apply a reviewed forward-fix migration rather than manually editing production schema.
- Re-run `/api/health`, `/api/readiness`, and the E2E suite after rollback or forward fix.
