-- Mzansi Word — initial schema.
-- Security model: RLS is enabled on every table. Clients (anon/authenticated
-- keys) may only SELECT their own rows on profiles/plays/prizes. Tables with
-- no policies (puzzles, words_*, draws, audit_log) are service-role only:
-- puzzle answers must never be readable by a client key.

-- ---------------------------------------------------------------- tracks

create table public.language_tracks (
  code text primary key,
  name text not null,
  enabled boolean not null default false
);

alter table public.language_tracks enable row level security;

create policy language_tracks_read_all on public.language_tracks
  for select using (true);

insert into public.language_tracks (code, name, enabled) values
  ('xh', 'isiXhosa', true),
  ('en', 'English', true),
  ('zu', 'isiZulu', false),
  ('af', 'Afrikaans', false);

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  first_name text,
  consent_popia_at timestamptz,
  device_fp text,
  current_streak int not null default 0,
  best_streak int not null default 0,
  last_solved_date date,
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Clients may only write first_name; streaks/consent/ban are server-set.
revoke update on public.profiles from anon, authenticated;
grant update (first_name) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------- words

create table public.words_answers (
  id bigserial primary key,
  track_code text not null references public.language_tracks (code),
  word text not null check (word ~ '^[a-z]{4,6}$'),
  length smallint generated always as (char_length(word)) stored,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected')),
  source text not null default 'ai-draft',
  unique (track_code, word)
);

create table public.words_guesses (
  track_code text not null references public.language_tracks (code),
  word text not null check (word ~ '^[a-z]{4,6}$'),
  primary key (track_code, word)
);

alter table public.words_answers enable row level security;
alter table public.words_guesses enable row level security;
revoke all on public.words_answers from anon, authenticated;
revoke all on public.words_guesses from anon, authenticated;

-- ---------------------------------------------------------------- puzzles

-- puzzle_date is the SAST calendar date. No client policy, ever: the answer
-- column must be unreadable with anon/authenticated keys.
create table public.puzzles (
  id bigserial primary key,
  track_code text not null references public.language_tracks (code),
  puzzle_date date not null,
  answer text not null check (answer ~ '^[a-z]{4,6}$'),
  length smallint not null,
  unique (track_code, puzzle_date)
);

alter table public.puzzles enable row level security;
revoke all on public.puzzles from anon, authenticated;

-- ---------------------------------------------------------------- plays

create table public.plays (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id),
  puzzle_id bigint not null references public.puzzles (id),
  guesses jsonb not null default '[]', -- [{word, marks: [0|1|2, ...]}]
  guess_count smallint not null default 0,
  solved boolean not null default false,
  started_at timestamptz not null default now(), -- set on first guess
  finished_at timestamptz,
  solve_ms int,
  flagged boolean not null default false,
  flag_reason text,
  unique (user_id, puzzle_id)
);

create index plays_puzzle_solved_idx on public.plays (puzzle_id) where solved;

alter table public.plays enable row level security;

create policy plays_select_own on public.plays
  for select using (user_id = auth.uid());

-- All writes go through service-role route handlers so marks can't be forged.
revoke insert, update, delete on public.plays from anon, authenticated;

-- ---------------------------------------------------------------- draws

create table public.draws (
  id bigserial primary key,
  draw_date date not null,
  type text not null check (type in ('daily', 'weekly_streak')),
  seed text not null,
  algorithm text not null,
  entrants jsonb not null, -- sorted snapshot: [{user_id, entry_key}]
  entrant_count int not null,
  winners_requested int not null,
  executed_at timestamptz not null default now(),
  unique (draw_date, type)
);

alter table public.draws enable row level security;
revoke all on public.draws from anon, authenticated;

-- ---------------------------------------------------------------- prizes

create table public.prizes (
  id bigserial primary key,
  draw_id bigint not null references public.draws (id),
  user_id uuid not null references public.profiles (id),
  amount_cents int not null default 2900,
  status text not null default 'pending_claim'
    check (status in ('pending_claim', 'claimed', 'paid', 'expired')),
  expires_at timestamptz not null,
  network text,
  claim_msisdn text,
  winner_wall_consent boolean not null default false,
  claimed_at timestamptz,
  paid_at timestamptz,
  paid_by text,
  payout_provider text not null default 'manual',
  payout_ref text,
  created_at timestamptz not null default now()
);

create index prizes_user_idx on public.prizes (user_id, created_at);
create index prizes_status_idx on public.prizes (status);

alter table public.prizes enable row level security;

create policy prizes_select_own on public.prizes
  for select using (user_id = auth.uid());

revoke insert, update, delete on public.prizes from anon, authenticated;

-- ---------------------------------------------------------------- audit

create table public.audit_log (
  id bigserial primary key,
  actor text not null, -- 'cron' | admin phone | 'system'
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;

-- ---------------------------------------------------------------- streaks

-- Any-track streak, updated atomically on solve (a single UPDATE, so two
-- concurrent track solves cannot double-increment). Service role only.
create or replace function public.update_streak_on_solve(
  p_user uuid,
  p_today date,
  p_yesterday date
)
returns table (current_streak int, best_streak int)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p set
    current_streak = case
      when p.last_solved_date = p_today then p.current_streak
      when p.last_solved_date = p_yesterday then p.current_streak + 1
      else 1
    end,
    best_streak = greatest(p.best_streak, case
      when p.last_solved_date = p_today then p.current_streak
      when p.last_solved_date = p_yesterday then p.current_streak + 1
      else 1
    end),
    last_solved_date = p_today
  where p.id = p_user;

  return query
    select p.current_streak, p.best_streak
    from public.profiles p where p.id = p_user;
end;
$$;

revoke execute on function public.update_streak_on_solve(uuid, date, date)
  from public, anon, authenticated;

-- ---------------------------------------------------------------- winner wall

-- Rendered server-side with the service role; not exposed to client keys.
create view public.winner_wall
  with (security_invoker = on) as
select
  pr.id,
  p.first_name,
  left(pr.claim_msisdn, 3) || ' *** **' || right(pr.claim_msisdn, 2)
    as masked_msisdn,
  pr.amount_cents,
  d.draw_date,
  d.type as draw_type
from public.prizes pr
join public.profiles p on p.id = pr.user_id
join public.draws d on d.id = pr.draw_id
where pr.winner_wall_consent
  and pr.status in ('claimed', 'paid');

revoke all on public.winner_wall from anon, authenticated;
