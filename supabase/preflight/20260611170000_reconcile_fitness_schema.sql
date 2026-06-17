-- Run this read-only preflight before applying 20260611170000_reconcile_fitness_schema.sql.
-- Every query must return zero rows.

select * from public.profiles
where age is null or weight_kg is null or height_cm is null or gender is null
   or activity_level is null or goal is null
   or age not between 1 and 120
   or weight_kg not between 20 and 300
   or height_cm not between 50 and 250
   or gender not in ('male', 'female')
   or activity_level not in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')
   or goal not in ('lose_weight', 'build_muscle', 'stay_fit');

select user_id, date, count(*) from public.meal_plans
 group by user_id, date having count(*) > 1;
select user_id, date, count(*) from public.workout_plans
 group by user_id, date having count(*) > 1;
select user_id, date, count(*) from public.water_intake
 group by user_id, date having count(*) > 1;

select * from public.water_intake
where user_id is null or date is null or glasses_consumed is null
   or glasses_consumed < 0 or goal is null or goal <= 0;
select * from public.workout_plans
where user_id is null or date is null or workout_type is null or duration_minutes is null
   or duration_minutes <= 0 or difficulty is null or exercises is null
   or jsonb_typeof(exercises) <> 'array';
select * from public.workout_sessions
where user_id is null or workout_name is null or length(trim(workout_name)) = 0
   or duration_minutes is null or duration_minutes <= 0 or exercises is null
   or jsonb_typeof(exercises) <> 'array' or completed_at is null;
select * from public.meal_plans
where user_id is null or date is null or goal is null or calories_target is null
   or calories_target <= 0 or meals is null;
select * from public.tde_estimates
where user_id is null or tde_value is null or tde_value <= 0 or method is null;

select 'profiles' as table_name, p.id as orphan_user_id
from public.profiles p left join auth.users u on u.id = p.id where u.id is null
union all select 'tde_estimates', t.user_id from public.tde_estimates t left join auth.users u on u.id = t.user_id where u.id is null
union all select 'water_intake', w.user_id from public.water_intake w left join auth.users u on u.id = w.user_id where u.id is null
union all select 'workout_plans', w.user_id from public.workout_plans w left join auth.users u on u.id = w.user_id where u.id is null
union all select 'workout_sessions', w.user_id from public.workout_sessions w left join auth.users u on u.id = w.user_id where u.id is null
union all select 'meal_plans', m.user_id from public.meal_plans m left join auth.users u on u.id = m.user_id where u.id is null;
