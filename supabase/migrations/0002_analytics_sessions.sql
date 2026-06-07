-- Analytics expansion: per-visit sessions (duration, bounce, geo, device,
-- scroll) plus a session_id link on events for behavioral analytics.

create table if not exists public.sessions (
  id           text primary key,
  visitor_id   text,
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  duration_ms  bigint not null default 0,
  active_ms    bigint not null default 0,
  page_views   int not null default 0,
  events_count int not null default 0,
  max_scroll   int not null default 0,
  entry_path   text,
  exit_path    text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  country      text,
  region       text,
  city         text,
  device       text,
  browser      text,
  os           text,
  user_agent   text,
  bounced      boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists sessions_visitor_idx on public.sessions (visitor_id);
create index if not exists sessions_created_idx on public.sessions (created_at desc);
create index if not exists sessions_country_idx on public.sessions (country);
create index if not exists sessions_device_idx on public.sessions (device);

alter table public.events add column if not exists session_id text;
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_type_path_idx on public.events (type, path);

alter table public.sessions enable row level security;
