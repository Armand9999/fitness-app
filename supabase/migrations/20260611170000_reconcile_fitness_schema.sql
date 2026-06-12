-- Reconcile the existing fitness-app database with the application contract.
-- Preflight data-quality queries must return no rows before this migration is applied.
-- The existing food_logs table is intentionally preserved and left unchanged.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
alter table public.profiles
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  alter column weight_kg type numeric(6, 2) using weight_kg::numeric,
  alter column height_cm type numeric(6, 2) using height_cm::numeric,
  alter column age set not null,
  alter column weight_kg set not null,
  alter column height_cm set not null,
  alter column gender set not null,
  alter column activity_level set not null,
  alter column goal set not null;

alter table public.profiles
  drop constraint if exists profiles_age_check,
  drop constraint if exists profiles_weight_kg_check,
  drop constraint if exists profiles_height_cm_check,
  drop constraint if exists profiles_gender_check,
  drop constraint if exists profiles_activity_level_check,
  drop constraint if exists profiles_goal_check,
  add constraint profiles_age_check check (age between 1 and 120),
  add constraint profiles_weight_kg_check check (weight_kg between 20 and 300),
  add constraint profiles_height_cm_check check (height_cm between 50 and 250),
  add constraint profiles_gender_check check (gender in ('male', 'female')),
  add constraint profiles_activity_level_check check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  add constraint profiles_goal_check check (goal in ('lose_weight', 'build_muscle', 'stay_fit'));

-- TDEE history: the existing database used the misspelled create_at column.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tde_estimates' and column_name = 'create_at'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'tde_estimates' and column_name = 'created_at'
  ) then
    alter table public.tde_estimates rename column create_at to created_at;
  end if;
end;
$$;

alter table public.tde_estimates
  add column if not exists created_at timestamptz default now();

update public.tde_estimates set created_at = now() where created_at is null;

alter table public.tde_estimates
  alter column user_id set not null,
  alter column tde_value set not null,
  alter column method set not null,
  alter column created_at type timestamptz using created_at at time zone 'UTC',
  alter column created_at set default now(),
  alter column created_at set not null;

alter table public.tde_estimates
  drop constraint if exists tde_estimates_tde_value_check,
  drop constraint if exists tde_estimates_method_check,
  add constraint tde_estimates_tde_value_check check (tde_value > 0),
  add constraint tde_estimates_method_check check (method in ('Mifflin-St Jeor'));

-- Daily water intake
alter table public.water_intake
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.water_intake
  alter column user_id set not null,
  alter column date set not null,
  alter column glasses_consumed set default 0,
  alter column glasses_consumed set not null,
  alter column goal set default 8,
  alter column goal set not null;

alter table public.water_intake
  drop constraint if exists water_intake_glasses_consumed_check,
  drop constraint if exists water_intake_goal_check,
  add constraint water_intake_glasses_consumed_check check (glasses_consumed >= 0),
  add constraint water_intake_goal_check check (goal > 0);

create unique index if not exists water_intake_user_date_unique_idx
  on public.water_intake (user_id, date);

-- Daily workout plans
alter table public.workout_plans
  add column if not exists updated_at timestamptz not null default now();

update public.workout_plans set created_at = now() where created_at is null;

alter table public.workout_plans
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column user_id set not null,
  alter column date set not null,
  alter column workout_type set not null,
  alter column duration_minutes set not null,
  alter column difficulty set not null,
  alter column exercises set not null;

alter table public.workout_plans
  drop constraint if exists workout_plans_user_id_date_workout_type_key,
  drop constraint if exists workout_plans_workout_type_check,
  drop constraint if exists workout_plans_duration_minutes_check,
  drop constraint if exists workout_plans_difficulty_check,
  drop constraint if exists workout_plans_exercises_check,
  add constraint workout_plans_workout_type_check check (workout_type in ('cardio', 'strength', 'full_body', 'flexibility')),
  add constraint workout_plans_duration_minutes_check check (duration_minutes > 0),
  add constraint workout_plans_difficulty_check check (difficulty in ('beginner', 'intermediate', 'advanced')),
  add constraint workout_plans_exercises_check check (jsonb_typeof(exercises) = 'array');

create unique index if not exists workout_plans_user_date_unique_idx
  on public.workout_plans (user_id, date);

-- Completed workout history
update public.workout_sessions set created_at = now() where created_at is null;

alter table public.workout_sessions
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column user_id set not null,
  alter column workout_name set not null,
  alter column duration_minutes set not null,
  alter column exercises set not null,
  alter column completed_at set default now(),
  alter column completed_at set not null;

alter table public.workout_sessions
  drop constraint if exists workout_sessions_workout_name_check,
  drop constraint if exists workout_sessions_duration_minutes_check,
  drop constraint if exists workout_sessions_exercises_check,
  add constraint workout_sessions_workout_name_check check (length(trim(workout_name)) > 0),
  add constraint workout_sessions_duration_minutes_check check (duration_minutes > 0),
  add constraint workout_sessions_exercises_check check (jsonb_typeof(exercises) = 'array');

-- Daily meal plans
alter table public.meal_plans
  add column if not exists updated_at timestamptz not null default now();

update public.meal_plans set created_at = now() where created_at is null;

alter table public.meal_plans
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column user_id set not null,
  alter column date set not null,
  alter column goal set not null,
  alter column calories_target set not null,
  alter column meals set not null;

alter table public.meal_plans
  drop constraint if exists meal_plans_goal_check,
  drop constraint if exists meal_plans_calories_target_check,
  add constraint meal_plans_goal_check check (goal in ('lose_weight', 'build_muscle', 'stay_fit')),
  add constraint meal_plans_calories_target_check check (calories_target > 0);

create unique index if not exists meal_plans_user_date_unique_idx
  on public.meal_plans (user_id, date);

-- Replace user foreign keys with cascading ownership. Preflight verifies there are no orphan rows.
do $$
declare
  target record;
  existing_fk record;
begin
  for target in
    select * from (values
      ('profiles', 'id', 'profiles_id_fkey'),
      ('tde_estimates', 'user_id', 'tde_estimates_user_id_fkey'),
      ('water_intake', 'user_id', 'water_intake_user_id_fkey'),
      ('workout_plans', 'user_id', 'workout_plans_user_id_fkey'),
      ('workout_sessions', 'user_id', 'workout_sessions_user_id_fkey'),
      ('meal_plans', 'user_id', 'meal_plans_user_id_fkey')
    ) as ownership(table_name, column_name, constraint_name)
  loop
    for existing_fk in
      select conname
      from pg_constraint
      where conrelid = format('public.%I', target.table_name)::regclass
        and confrelid = 'auth.users'::regclass
        and contype = 'f'
    loop
      execute format('alter table public.%I drop constraint %I', target.table_name, existing_fk.conname);
    end loop;

    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references auth.users(id) on delete cascade',
      target.table_name,
      target.constraint_name,
      target.column_name
    );
  end loop;
end;
$$;

create index if not exists tde_estimates_user_created_at_idx
  on public.tde_estimates (user_id, created_at desc);
create index if not exists workout_sessions_user_completed_at_idx
  on public.workout_sessions (user_id, completed_at desc);

-- Keep mutable-row timestamps current.
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists water_intake_set_updated_at on public.water_intake;
create trigger water_intake_set_updated_at before update on public.water_intake
for each row execute function public.set_updated_at();

drop trigger if exists workout_plans_set_updated_at on public.workout_plans;
create trigger workout_plans_set_updated_at before update on public.workout_plans
for each row execute function public.set_updated_at();

drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at before update on public.meal_plans
for each row execute function public.set_updated_at();

-- Reconcile policies so overlapping legacy policies cannot broaden access.
do $$
declare
  target_table text;
  existing_policy record;
begin
  foreach target_table in array array[
    'profiles', 'tde_estimates', 'water_intake',
    'workout_plans', 'workout_sessions', 'meal_plans'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);

    for existing_policy in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = target_table
    loop
      execute format('drop policy %I on public.%I', existing_policy.policyname, target_table);
    end loop;
  end loop;
end;
$$;

create policy "Users can read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can create their profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can delete their profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "Users can read their TDEE estimates" on public.tde_estimates for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their TDEE estimates" on public.tde_estimates for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete their TDEE estimates" on public.tde_estimates for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their water intake" on public.water_intake for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their water intake" on public.water_intake for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their water intake" on public.water_intake for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their water intake" on public.water_intake for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their workout plans" on public.workout_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their workout plans" on public.workout_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their workout plans" on public.workout_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their workout plans" on public.workout_plans for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their workout sessions" on public.workout_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their workout sessions" on public.workout_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their workout sessions" on public.workout_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their workout sessions" on public.workout_sessions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can read their meal plans" on public.meal_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their meal plans" on public.meal_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their meal plans" on public.meal_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their meal plans" on public.meal_plans for delete to authenticated using ((select auth.uid()) = user_id);

-- Authenticated atomic profile save and TDEE calculation.
create or replace function public.save_profile_with_tde(
  profile_age integer,
  profile_weight_kg numeric,
  profile_height_cm numeric,
  profile_gender text,
  profile_activity_level text,
  profile_goal text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  calculated_tde integer;
  activity_multiplier numeric;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.profiles (id, age, weight_kg, height_cm, gender, activity_level, goal)
  values (current_user_id, profile_age, profile_weight_kg, profile_height_cm, profile_gender, profile_activity_level, profile_goal)
  on conflict (id) do update set
    age = excluded.age,
    weight_kg = excluded.weight_kg,
    height_cm = excluded.height_cm,
    gender = excluded.gender,
    activity_level = excluded.activity_level,
    goal = excluded.goal;

  activity_multiplier := case profile_activity_level
    when 'sedentary' then 1.2
    when 'lightly_active' then 1.375
    when 'moderately_active' then 1.55
    when 'very_active' then 1.725
    when 'extra_active' then 1.9
  end;

  calculated_tde := round((case profile_gender
    when 'male' then 10 * profile_weight_kg + 6.25 * profile_height_cm - 5 * profile_age + 5
    when 'female' then 10 * profile_weight_kg + 6.25 * profile_height_cm - 5 * profile_age - 161
  end) * activity_multiplier)::integer;

  insert into public.tde_estimates (user_id, tde_value, method)
  values (current_user_id, calculated_tde, 'Mifflin-St Jeor');
end;
$$;

revoke all on function public.save_profile_with_tde(integer, numeric, numeric, text, text, text) from public;
grant execute on function public.save_profile_with_tde(integer, numeric, numeric, text, text, text) to authenticated;

-- Add dashboard tables to Realtime only when they are not already members.
do $$
declare
  target_table text;
begin
  foreach target_table in array array['water_intake', 'workout_sessions', 'meal_plans']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target_table);
    end if;
  end loop;
end;
$$;
