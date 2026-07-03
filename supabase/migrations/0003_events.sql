-- Lightweight first-party analytics. POPIA-conscious: no device IDs, no IP,
-- no fingerprints — only the authed user_id (nullable for guests), an event
-- name from a server-side whitelist, and small JSON props. Service-role
-- writes only; read via admin pages.

create table public.events (
  id bigserial primary key,
  name text not null check (char_length(name) <= 40),
  user_id uuid references auth.users (id) on delete set null,
  track text,
  props jsonb,
  created_at timestamptz not null default now()
);

create index events_name_time_idx on public.events (name, created_at);
create index events_time_idx on public.events (created_at);

alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
