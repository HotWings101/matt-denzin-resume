-- ============================================================================
-- Matt Denzin — AI-first résumé site
-- Initial schema: RAG corpus, chat, analytics events, JD analyses, contact.
--
-- Security model: the browser NEVER queries these tables directly. All writes
-- and admin reads go through Next.js server code using the Supabase SERVICE ROLE
-- key (which bypasses RLS). RLS is enabled with no public policies, so the
-- anon/publishable key (used only for admin Auth) cannot read or write data.
-- ============================================================================

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- resume_chunks — embedded knowledge base for the "Interview my career" chat
-- (text-embedding-3-small → 1536 dimensions)
-- ---------------------------------------------------------------------------
create table if not exists public.resume_chunks (
  id          uuid primary key default gen_random_uuid(),
  chunk_id    text unique not null,
  topic       text not null,
  source      text,
  content     text not null,
  tags        text[] not null default '{}',
  embedding   vector(1536),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists resume_chunks_embedding_idx
  on public.resume_chunks using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- chat_sessions / chat_messages — track every "interview" conversation
-- ---------------------------------------------------------------------------
create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text,
  user_agent  text,
  referrer    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  citations   jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_session_idx
  on public.chat_messages (session_id, created_at);

-- ---------------------------------------------------------------------------
-- events — generic, "track everything" analytics stream
--   type: page_view | section_view | cta_click | resume_download
--         | chat_open | chat_question | jd_submit | contact_submit
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  path        text,
  visitor_id  text,
  meta        jsonb not null default '{}',
  user_agent  text,
  referrer    text,
  created_at  timestamptz not null default now()
);

create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_created_idx on public.events (created_at desc);

-- ---------------------------------------------------------------------------
-- jd_analyses — saved results from the JD-Fit Analyzer
-- ---------------------------------------------------------------------------
create table if not exists public.jd_analyses (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  text,
  role_title  text,
  company     text,
  jd_text     text not null,
  fit_score   int,
  result      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists jd_analyses_created_idx on public.jd_analyses (created_at desc);

-- ---------------------------------------------------------------------------
-- contact_messages — submissions from the contact form
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  visitor_id  text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Vector similarity search used by the chat retriever (called server-side).
-- ---------------------------------------------------------------------------
create or replace function public.match_resume_chunks(
  query_embedding vector(1536),
  match_count int default 6,
  similarity_threshold float default 0.0
)
returns table (
  id         uuid,
  chunk_id   text,
  topic      text,
  source     text,
  content    text,
  tags       text[],
  similarity float
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    rc.id,
    rc.chunk_id,
    rc.topic,
    rc.source,
    rc.content,
    rc.tags,
    1 - (rc.embedding <=> query_embedding) as similarity
  from public.resume_chunks rc
  where rc.embedding is not null
    and 1 - (rc.embedding <=> query_embedding) >= similarity_threshold
  order by rc.embedding <=> query_embedding
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security — enable on every table. No public policies are created,
-- so anon/authenticated roles get zero access; the service role (server-side)
-- bypasses RLS for all reads and writes.
-- ---------------------------------------------------------------------------
alter table public.resume_chunks    enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.events           enable row level security;
alter table public.jd_analyses      enable row level security;
alter table public.contact_messages enable row level security;
