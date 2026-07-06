-- Migration 0005 — Streak shields (RFC-0002, Slice B1).
--
-- The unified streak (RFC-0001) is the retention spine but is brittle in the
-- 0→7-day window where the habit is most fragile. Shields are a passive safety
-- net: every player holds up to 2, and a one-day (or, with 2 shields, two-day)
-- gap is auto-bridged by spending shields instead of resetting the streak.
-- Forgiving early, strict late — a gap larger than the shields held still resets.
--
-- Never sold — grant/earn only (Principle 1, CPA s36). This ships B1 alone; the
-- B2 repair columns (pre_lapse_streak / lapse_date / repair_progress) are held
-- until B1 data justifies them (see RFC-0002 "Decision"), so they are NOT added
-- here — a deferred feature earns no unused schema.

-- ------------------------------------------------------------------ column

-- ADD COLUMN ... NOT NULL DEFAULT 2 backfills every existing row to 2 in the
-- same statement, so pre-launch players are granted their 2 shields here. New
-- players inherit the default via the handle_new_user insert (migration 0001) —
-- no trigger change needed.
alter table public.profiles
  add column streak_shields smallint not null default 2
    check (streak_shields between 0 and 2);

-- Belt-and-braces one-time backfill (a no-op after the ADD above; only matters
-- if the column were ever created without the default). Harmless to re-run.
update public.profiles set streak_shields = 2 where streak_shields = 0;

-- ------------------------------------------------------------------ function

-- The atomic streak update becomes shield-aware. The return shape gains two
-- columns (remaining shields + whether a shield was spent), so we must drop and
-- recreate rather than CREATE OR REPLACE.
drop function if exists public.update_streak_on_solve(uuid, date, date);

-- Shield-aware, still a SINGLE atomic UPDATE so two concurrent qualifying
-- actions can never double-increment (the RFC-0001 guarantee). The streak math
-- lives entirely in the UPDATE's SET clause (EvalPlanQual re-evaluates it against
-- the latest committed row under concurrency); the `prev` CTE is read only to
-- report shield_used for telemetry and never feeds the streak computation.
--
--   missed := p_today - last_solved_date - 1   -- calendar days skipped
--     last = today        → already acted today, no change  (idempotent)
--     last = yesterday    → +1                               (consecutive)
--     missed in 1..shields → +1, spend `missed` shields      (bridge the gap)
--     otherwise            → reset to 1, shields untouched    (strict late / first ever)
create or replace function public.update_streak_on_solve(
  p_user uuid,
  p_today date,
  p_yesterday date
)
returns table (
  current_streak int,
  best_streak int,
  shields_remaining int,
  shield_used boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with prev as (
    select p.streak_shields as s
    from public.profiles p
    where p.id = p_user
  ),
  upd as (
    update public.profiles p set
      current_streak = case
        when p.last_solved_date = p_today then p.current_streak
        when p.last_solved_date = p_yesterday then p.current_streak + 1
        when p.last_solved_date is not null
          and p_today - p.last_solved_date >= 2
          and (p_today - p.last_solved_date - 1) <= p.streak_shields
          then p.current_streak + 1
        else 1
      end,
      best_streak = greatest(p.best_streak, case
        when p.last_solved_date = p_today then p.current_streak
        when p.last_solved_date = p_yesterday then p.current_streak + 1
        when p.last_solved_date is not null
          and p_today - p.last_solved_date >= 2
          and (p_today - p.last_solved_date - 1) <= p.streak_shields
          then p.current_streak + 1
        else 1
      end),
      streak_shields = case
        when p.last_solved_date is not null
          and p_today - p.last_solved_date >= 2
          and (p_today - p.last_solved_date - 1) <= p.streak_shields
          then p.streak_shields - (p_today - p.last_solved_date - 1)
        else p.streak_shields
      end,
      last_solved_date = p_today
    where p.id = p_user
    returning p.current_streak, p.best_streak, p.streak_shields
  )
  select
    upd.current_streak,
    upd.best_streak,
    upd.streak_shields,
    (prev.s > upd.streak_shields) as shield_used
  from upd, prev;
end;
$$;

revoke execute on function public.update_streak_on_solve(uuid, date, date)
  from public, anon, authenticated;
