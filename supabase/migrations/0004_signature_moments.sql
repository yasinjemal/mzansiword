-- Signature Moments server mirror (Game Design Bible §6.5).
-- No prize/economy value is attached — the client resolves moments locally
-- (like Journey); this table only lets a logged-in player's earned moments
-- follow them across devices. Players may read their own rows; all writes go
-- through the service-role route (/api/signature).

create table public.signature_moments (
  user_id uuid not null references auth.users (id) on delete cascade,
  moment_id text not null check (char_length(moment_id) <= 40),
  achieved_at timestamptz not null default now(),
  primary key (user_id, moment_id)
);

create index signature_moments_user_idx on public.signature_moments (user_id);

alter table public.signature_moments enable row level security;

-- Read-your-own; writes are service-role only (no insert/update policy).
create policy "select own signature moments"
  on public.signature_moments
  for select
  using (auth.uid() = user_id);
