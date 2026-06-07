# Matt Denzin — AI-first Résumé Site · Design Spec

**Status:** approved (design direction), in implementation
**Owner:** Matt Denzin
**Date:** 2026-06-07

## Goal

Turn Matt Denzin's résumé into an **AI-first, fully instrumented website** that itself
serves as proof of AI-product capability — supporting his search for AI-first Product
Manager / Product / Program Management roles. The medium is the message: a recruiter
should *experience* a small, real AI product with Matt as the subject.

## Principles

- **The site is the work sample.** Every feature should read as "this person can scope,
  ship, and measure an AI product."
- **Grounded, not gimmicky.** AI features must be genuinely useful to a recruiter and
  never hallucinate facts about Matt.
- **Track everything.** Page views, section engagement, chat questions, JD analyses, and
  contact submissions are all captured for a private analytics view.

## Aesthetic

Modern AI-product, light theme. "An operating system for a career" — instrument-like
precision with editorial credibility (nods to Matt's journalism degree).

- **Type:** Fraunces (display serif) + Geist Sans (body) + Geist Mono (labels/data).
- **Color:** warm bone background, deep ink text, indigo as a sharp accent.
- **Texture:** faint grid/dot background, restrained staggered motion on load + scroll.

## Architecture

- **Next.js 16** (App Router, TypeScript, Tailwind v4) on **Vercel** (Fluid Compute).
- **Supabase**: Postgres + pgvector (RAG), Auth (admin), and tables for chat/events/JD/contact.
- **Vercel AI SDK + AI Gateway** for chat (Claude) and embeddings (text-embedding-3-small).
- **GitHub** private repo → auto-deploy to Vercel.

### Data model (`supabase/migrations/0001_init.sql`)

| Table | Purpose |
|-------|---------|
| `resume_chunks` | Embedded knowledge base for RAG (pgvector, 1536-dim). |
| `chat_sessions` / `chat_messages` | Every "interview my career" conversation. |
| `events` | Generic analytics stream (page_view, section_view, cta_click, …). |
| `jd_analyses` | Saved JD-Fit Analyzer results. |
| `contact_messages` | Contact-form submissions. |

**Security:** the browser never queries Supabase tables directly. All writes and admin
reads run server-side with the **service role** key. RLS is enabled with no public
policies (default-deny). The anon key is used only for admin Auth.

### Single source of truth

`src/data/resume.ts` drives the rendered UI. `src/data/knowledge.ts` holds curated,
retrieval-friendly passages. `scripts/ingest.ts` embeds both into `resume_chunks`.

## Features (built in three phases, deployed once)

1. **Foundation** — full résumé UI (hero with AI input, experience timeline, skills,
   recommendations, contact form → Supabase), page-view + section tracking.
2. **AI core** — "Interview my career" RAG chat: streaming, grounded, with source
   citations; questions tracked.
3. **Standout + insights** — JD-Fit Analyzer (paste a job description → structured fit
   analysis + pitch) and a private admin analytics dashboard (Supabase Auth-gated).

## Routes

- `/` — résumé site (all public sections + chat + JD analyzer)
- `/api/chat` — streaming RAG chat
- `/api/jd-fit` — JD analysis (structured output)
- `/api/track` — event ingestion
- `/api/contact` — contact submissions
- `/admin` — Auth-gated analytics dashboard
- `/admin/login` — Supabase Auth sign-in

## Environment

See `.env.example`. Key vars: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_GATEWAY_API_KEY`,
`ADMIN_EMAILS`, `CHAT_MODEL`, `EMBEDDING_MODEL`.

## Out of scope (for now)

- Email notifications on contact/JD (could add Resend later).
- Multi-user admin / RBAC (single admin allowlist by email).
- Dark mode toggle (light theme approved; tokens are structured to allow it later).
