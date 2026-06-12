# Matt Denzin — AI-first Résumé Site

An AI-native résumé and portfolio for **Matthew Denzin, PMP** — built to *demonstrate*
AI-product capability, not just describe it. The site is itself a small, instrumented AI
product with Matt as the subject.

## What it does

- **Interview my career** — a retrieval-grounded (RAG) chat. Ask Matt's 15-year record
  anything; answers are grounded in his résumé with source citations and stream in real time.
- **JD-Fit Analyzer** — paste a job description and get a structured fit analysis (score,
  strengths mapped to requirements, honest gaps, and a tailored first-person pitch).
- **Instrumented** — page views, section engagement, chat questions, JD analyses, and contact
  submissions are tracked to a private, auth-gated `/admin` analytics dashboard.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, RSC) + TypeScript |
| Styling | Tailwind v4 · Fraunces + Geist · bespoke design system |
| AI | Vercel AI SDK v6 via **AI Gateway** (Claude chat + OpenAI embeddings) |
| Data | Supabase Postgres + **pgvector** (RAG), Auth (admin), RLS default-deny |
| Hosting | Vercel (Fluid Compute) |

## Architecture

- `src/data/resume.ts` — single source of truth for the UI **and** the AI knowledge base.
- `src/data/knowledge.ts` — curated, retrieval-friendly passages.
- `scripts/ingest.ts` — embeds the corpus into `resume_chunks` (`npm run ingest`).
- `scripts/gen-resume.tsx` — renders a 2-page PDF résumé from `resume.ts` (`npm run resume`).
- `src/app/api/*` — chat (streaming RAG), jd-fit (structured output), track, contact.
- `supabase/migrations/0001_init.sql` — schema, pgvector search fn, RLS.
- Security: the browser never queries Supabase directly. All writes/admin reads use the
  **service role** key server-side; RLS is enabled with no public policies; the anon key is
  used only for admin Auth. `/admin` is guarded by middleware against an `ADMIN_EMAILS` allowlist.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase + AI Gateway values
npm run dev                  # http://localhost:3000
```

To populate the RAG corpus after Supabase is set up:

```bash
npm run ingest
```

### Résumé PDF

The downloadable PDF (`public/Matthew-Denzin-Resume.pdf`, linked from the site header) is
generated from `src/data/resume.ts` — the same source of truth as the site. After editing
résumé content, regenerate it and commit the updated file (it's a static asset, so it does
**not** rebuild automatically on deploy):

```bash
npm run resume
```

## Environment

See [`.env.example`](./.env.example). Required: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_GATEWAY_API_KEY`,
`ADMIN_EMAILS`. Optional overrides: `CHAT_MODEL`, `EMBEDDING_MODEL`, `NEXT_PUBLIC_SITE_URL`.

## Deployment

Pushed to a private GitHub repo and deployed on Vercel. Supabase migrations live in
`supabase/migrations/`. Set the environment variables in the Vercel project, then run the
ingest step once against the production database.

---

Built with Next.js, Supabase, and the Vercel AI SDK.
