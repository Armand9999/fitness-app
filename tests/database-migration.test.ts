import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { join } from 'node:path'

const baseline = readFileSync(
  join(process.cwd(), 'supabase/migrations/20260611155633_remote_baseline.sql'),
  'utf8',
)
const reconciliation = readFileSync(
  join(process.cwd(), 'supabase/migrations/20260611170000_reconcile_fitness_schema.sql'),
  'utf8',
)

const userOwnedTables = [
  'profiles',
  'tde_estimates',
  'water_intake',
  'workout_plans',
  'workout_sessions',
  'meal_plans',
]

describe('Supabase reconciliation migration contract', () => {
  it('keeps an empty marker for the already-applied remote baseline', () => {
    assert.equal(baseline, '')
  })

  it('alters existing tables instead of recreating them', () => {
    assert.doesNotMatch(reconciliation, /create table public\./)
    for (const table of userOwnedTables) {
      assert.match(reconciliation, new RegExp(`alter table public\\.${table}`))
    }
  })

  it('preserves the existing food logs table', () => {
    assert.doesNotMatch(reconciliation, /(?:drop|alter|truncate) table public\.food_logs/)
  })

  it('reconciles daily uniqueness, user ownership, and RLS', () => {
    assert.match(reconciliation, /water_intake_user_date_unique_idx/)
    assert.match(reconciliation, /workout_plans_user_date_unique_idx/)
    assert.match(reconciliation, /meal_plans_user_date_unique_idx/)
    assert.match(reconciliation, /references auth\.users\(id\) on delete cascade/)
    for (const table of userOwnedTables) {
      assert.match(reconciliation, new RegExp(`alter table public\\.%I enable row level security`))
      assert.match(reconciliation, new RegExp(`on public\\.${table}`))
    }
  })

  it('defines the authenticated atomic profile and TDEE function', () => {
    assert.match(reconciliation, /create or replace function public\.save_profile_with_tde/)
    assert.match(reconciliation, /current_user_id uuid := auth\.uid\(\)/)
    assert.match(reconciliation, /grant execute on function public\.save_profile_with_tde[\s\S]+to authenticated;/)
  })

  it('indexes history queries and safely reconciles Realtime membership', () => {
    assert.match(reconciliation, /tde_estimates_user_created_at_idx/)
    assert.match(reconciliation, /workout_sessions_user_completed_at_idx/)
    assert.match(reconciliation, /pg_publication_tables/)
  })
})
