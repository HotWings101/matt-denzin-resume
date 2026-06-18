# Visitor Analytics Enrichment — Design

**Date:** 2026-06-18
**Status:** Approved, ready for implementation planning
**Author:** Matt Denzin (with Claude)

## Problem

The admin analytics dashboard (`/admin`) shows a "Visitors" list that is hard to
read for the questions that actually matter:

1. **It shows sessions, not visitors.** The same person returning renders as
   multiple unmarked rows (e.g. `v_labl9gxn` appears 4×, `v_kp3ogioq` 2×). There
   is no "new vs returning" indicator, even though a `uniqueVisitors` total is
   computed elsewhere.
2. **No bot awareness in the list.** Bot detection today only catches *AI*
   crawlers (GPTBot, ClaudeBot, …) via user-agent in middleware, logged as
   separate `crawler_visit` events that never appear in the sessions list.
   Obvious automated traffic — datacenter hits (Council Bluffs = Google Cloud),
   and instant-bounce fingerprints (`0s` / `0%` scroll / single page-view /
   "US"-only geo) — is completely unflagged and pollutes headline stats.
3. **Limited visitor context.** No sense of *how* people arrive (traffic source)
   or *which visits matter* (recruiter / high-intent behavior).

## Goals

- Distinguish **unique** visitors and mark each session **New** or **Returning ×N**.
- Detect and flag **likely bots**; default the dashboard to humans-only with a
  reveal toggle. Nothing is deleted.
- Add derived signals: **traffic source**, **high-intent/recruiter badge**,
  **engagement quality score**, and **summary cards** (humans vs bots, new vs
  returning, returning rate).

## Non-Goals (scope guardrails)

- No database schema changes / migrations.
- No new tracking code or changes to how events are captured client-side.
- No new runtime dependencies (Vitest is a dev-only dependency for tests).
- No IP-intelligence / third-party bot service (Vercel BotID was considered and
  declined).
- No unrelated refactoring.

## Core Architectural Decision: compute at read time

Every signal is **derivable from data already stored**. The `sessions` and
`events` tables already carry `user_agent`, geo (`country`/`region`/`city`),
`max_scroll`, `active_ms`, `duration_ms`, `page_views`, `events_count`,
`referrer`, and UTM fields. Classification therefore happens at **read time** in
the data layer, not at write time.

Consequences:

- No migration, no backfill — applies **retroactively** to all existing history.
- Heuristics can be tuned later without touching stored data.
- All logic lives in one new **pure, I/O-free, unit-testable** module:
  `src/lib/bot-detection.ts`. `src/lib/analytics.ts` and `src/lib/visitors.ts`
  consume it.

## Components

### New module: `src/lib/bot-detection.ts` (pure functions)

| Function | Input | Output |
|---|---|---|
| `classifyBot` | session fields + journey + human-action flags | `{ verdict: "human" \| "likely-bot" \| "bot", reasons: string[] }` |
| `classifyVisitorType` | this session + visitor's all-time session count & first-seen | `{ type: "new" \| "returning", visitCount: number }` |
| `classifySource` | `referrer`, UTM fields | `"Direct" \| "Google Search" \| "LinkedIn" \| "Social" \| "Job board" \| "Referral"` |
| `classifyIntent` | session + journey + chat/jd/contact/resume-download flags | `{ highIntent: boolean, reasons: string[] }` |
| `engagementScore` | active_ms, max_scroll, page_views, interaction flags | `number` (0–100) |

#### `classifyBot` logic

- **`bot` (definitive):** user-agent matches a known bot pattern. Expand the
  current AI-crawler list to also include: search engines (Googlebot, Bingbot,
  DuckDuckBot, YandexBot, Applebot); link/social previewers (Slackbot,
  facebookexternalhit, Twitterbot, LinkedInBot, Discordbot, WhatsApp,
  TelegramBot); SEO scrapers (AhrefsBot, SemrushBot, MJ12bot, DotBot);
  headless/scripted clients (HeadlessChrome, PhantomJS, curl, wget,
  python-requests, Go-http-client, axios, node-fetch, Scrapy); uptime monitors
  (UptimeRobot, Pingdom, Lighthouse). Reuse/extend the existing list in
  `crawlers.ts` (single source of bot patterns).
- **`likely-bot` (heuristic, score ≥ 3):**
  - `0 active-time AND 0 max-scroll` → +2
  - single page-view AND instant exit (`duration < ~1s`) → +1
  - country present but **no city resolved** (datacenter tell) → +1
  - `events_count ≤ 1` → +1
  - known datacenter city (Council Bluffs, Ashburn, Boardman, …) → +1
- **Human override (false-positive guard):** any session with a real human
  action — chatted, ran JD-Fit, submitted contact, downloaded resume, or scrolled
  >50% with meaningful active time — is forced to `human` regardless of score.
- Each verdict carries human-readable `reasons` (e.g. `"GPTBot"`, or
  `"0s · no scroll · no city"`) shown in the UI for auditability.

#### `classifyVisitorType`

`visitors.ts` performs one extra lightweight query: for the visitor IDs in view,
count their **all-time** sessions and earliest `first_seen`. If this session is
the visitor's earliest → **New**; otherwise → **Returning** with
`visitCount = total sessions`.

### Data layer changes

- **`src/lib/visitors.ts`** — extend `VisitorSession` with: `botVerdict`,
  `botReasons`, `visitorType`, `visitCount`, `source`, `highIntent`,
  `intentReasons`, `engagementScore`. Add the all-time visit-count query and the
  per-session classification pass. (`user_agent` must be included in the session
  select for UA-based detection.)
- **`src/lib/analytics.ts`** — recompute humans-only headline totals (unique
  visitors, sessions, bounce rate, avg duration) by classifying sessions in JS
  over the window (bounded by a generous cap). Add summary aggregates (humans vs
  bots, new vs returning, returning rate) and a traffic-source breakdown.
  Chat/JD/contact counts are human by nature and remain unchanged.

### UI changes (`src/components/admin/`)

- **`visitors.tsx`** — default to humans-only; add a `Show bots (N)` toggle; each
  row gains badges for New/Returning ×N, traffic source, high-intent, and an
  engagement-quality score; bot rows show their reason.
- **`dashboard.tsx` / `ui.tsx`** — add summary cards (humans vs bots, new vs
  returning, returning rate) to the Visitors tab and a "Traffic sources" panel in
  the Audience tab.

## Data Flow

```
sessions + events (Supabase, unchanged)
        │  read (admin/service-role)
        ▼
visitors.ts / analytics.ts
        │  per-session + per-visitor classification
        ▼
bot-detection.ts (pure: bot / type / source / intent / quality)
        │
        ▼
admin dashboard (humans-only default, toggle, badges, summary cards)
```

## Error Handling & Edge Cases

- Classification is pure and total — never throws; unknown/missing fields
  degrade to `human` / `Direct` / score 0 rather than erroring.
- Existing graceful-degradation contract preserved: if Supabase is
  unconfigured, the data layer still returns empty results.
- False positives mitigated by the human-override rule and the always-available
  reveal toggle + visible reasons.
- Returning-count query is bounded; a visitor with many sessions is capped at a
  sensible limit.

## Testing

- Vitest (dev dependency) unit tests for every function in `bot-detection.ts`.
- Fixtures built from real observed data:
  - Council Bluffs / `0s` / `0%` / "US"-only rows → `likely-bot`.
  - `v_labl9gxn` (Dallas, 100% scroll, chatted) → `human`.
  - UA strings for GPTBot, Googlebot, HeadlessChrome, curl → `bot`.
  - New vs returning ordering; source bucketing from sample referrers/UTM.

## Rollout

Single PR on branch `analytics-visitor-enrichment`. No migration to run; ships
behind no flag (admin-only surface). Verified locally against existing data via
`npm run dev` → `/admin`.
