-- Journey mode: progress cursor + coin wallet. Same security model as 0001:
-- RLS on, clients may only SELECT their own rows, every write goes through
-- service-role route handlers. Coins are FREE-EARNED ONLY — a purchase path
-- would void the CPA promotional-competition framing of the prize draws.

create table public.journey_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  track_code text not null references public.language_tracks (code),
  levels_completed int not null default 0 check (levels_completed >= 0),
  bonus_words_found int not null default 0 check (bonus_words_found >= 0),
  hints_used int not null default 0 check (hints_used >= 0),
  imported_at timestamptz, -- guest-merge applied marker (one-shot)
  updated_at timestamptz not null default now(),
  primary key (user_id, track_code)
);

alter table public.journey_progress enable row level security;

create policy journey_progress_select_own on public.journey_progress
  for select using (user_id = auth.uid());

revoke insert, update, delete on public.journey_progress
  from anon, authenticated;

create table public.journey_wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  coins int not null default 0 check (coins >= 0),
  lifetime_coins int not null default 0 check (lifetime_coins >= 0),
  updated_at timestamptz not null default now()
);

alter table public.journey_wallets enable row level security;

create policy journey_wallets_select_own on public.journey_wallets
  for select using (user_id = auth.uid());

revoke insert, update, delete on public.journey_wallets
  from anon, authenticated;

-- Atomic earn: upserts the wallet and returns the new balance.
create or replace function public.award_journey_coins(p_user uuid, p_amount int)
returns int
language sql
security definer
set search_path = public
as $$
  insert into public.journey_wallets (user_id, coins, lifetime_coins, updated_at)
  values (p_user, greatest(p_amount, 0), greatest(p_amount, 0), now())
  on conflict (user_id) do update
    set coins = journey_wallets.coins + greatest(p_amount, 0),
        lifetime_coins = journey_wallets.lifetime_coins + greatest(p_amount, 0),
        updated_at = now()
  returning coins;
$$;

revoke execute on function public.award_journey_coins(uuid, int)
  from public, anon, authenticated;

-- Atomic spend: returns the new balance, or null when insufficient.
create or replace function public.spend_journey_coins(p_user uuid, p_cost int)
returns int
language sql
security definer
set search_path = public
as $$
  update public.journey_wallets
     set coins = coins - p_cost, updated_at = now()
   where user_id = p_user and coins >= p_cost and p_cost > 0
  returning coins;
$$;

revoke execute on function public.spend_journey_coins(uuid, int)
  from public, anon, authenticated;
