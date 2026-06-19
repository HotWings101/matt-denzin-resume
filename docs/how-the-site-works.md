# How This Website Works — Plain-English Overview

A non-technical guide to the three services that run
[matthewdenzin.ai](https://matthewdenzin.ai) and what each one does.

The site is built from three building blocks — **GitHub**, **Vercel**, and
**Supabase** — plus a rented AI "brain" (**Google Gemini**). They sound
technical, but each has one simple job. The easiest way to picture it is a
**restaurant**.

---

## The 30-second version

| Service | Plain role | Restaurant analogy |
|---|---|---|
| **GitHub** | Stores the master copy of the website's code + every past version | The **recipe book & blueprints** |
| **Vercel** | Turns that code into the live website and serves it to visitors | The **building, kitchen & staff** open to the public |
| **Supabase** | Remembers all the data the site needs to store | The **back-office filing cabinet & ledger** |
| **Google Gemini** | Powers the AI chat & JD-Fit analyzer | The **rented brain** the staff consult |

---

## GitHub — the master copy & history

GitHub holds the website's **source code** — the actual instructions that
define every page, the AI chat, the admin dashboard, and so on. It does two
things:

1. **Single source of truth** — there is one authoritative copy of the code,
   and it lives here.
2. **Time machine** — every change is saved as a "commit" with a note about
   what changed, so the full history is visible and *anything can be undone*.

Think of it as the **binder of blueprints and recipes**. It doesn't run
anything or serve anyone — it just safely holds the definitive plans and every
revision.

**This site's:** the private repository `HotWings101/matt-denzin-resume`.

## Vercel — the builder + the live storefront

Vercel watches GitHub. **Every time code is pushed to GitHub, Vercel
automatically:**

1. **Builds** it — turns the raw code into an optimized, runnable website, and
2. **Hosts & serves** it to the public at **matthewdenzin.ai**.

It's the **restaurant itself** — the building customers walk into, plus the
kitchen and waitstaff doing the work in real time. When a visitor loads the
résumé, runs the JD-Fit analyzer, or chats, Vercel's servers handle that
request. Vercel also manages the **domain** (matthewdenzin.ai) and the
**environment settings** (configuration values like `NEXT_PUBLIC_SITE_URL`).

That automatic build-on-push is the whole workflow: **commit to GitHub → it
goes live on Vercel about a minute later.**

**This site's:** Vercel project `matt-denzin-resume` (team
`hotwings101s-projects`). Primary domain **matthewdenzin.ai**; **matthewdenzin.com**
redirects to it.

## Supabase — the memory / filing cabinet

Code (GitHub) and hosting (Vercel) don't, by themselves, *remember* anything
between visits. Supabase is the **database** that stores all the information the
site needs to keep:

- **The AI's knowledge base** — the chunks of the career story the
  "Interview my career" chat pulls from to answer questions accurately.
- **Analytics** — every visitor session, page view, click, and scroll shown in
  the admin dashboard.
- **Chat conversations**, **JD-Fit results**, and **contact-form messages**.
- **Admin login** — the gate that keeps `/admin` private.

It's the **back-office filing cabinet and ledger**: the chef's reference binder
of facts, the reservation book, the record of every customer who came in. The
storefront (Vercel) talks to it constantly, but visitors never see it directly.

**This site's:** Supabase project `matt-denzin-resume`.

## Google Gemini — the rented brain (supporting cast)

The AI features (the career chat and the JD-Fit analyzer) need a large language
model to actually understand questions and write answers. Rather than building
one, the site rents Google's **Gemini** model. When someone chats, Vercel's
server pulls the relevant facts from Supabase and asks Gemini to turn them into
a grounded answer.

---

## How they work together (one visit)

```
You edit code → push to GitHub (blueprint updated)
                     │
                     ▼
        Vercel rebuilds & deploys to matthewdenzin.ai
                     │
                     ▼
   A recruiter visits the live site (served by Vercel)
                     │
                     ▼
   They ask the chat a question → Vercel's server reads the
   career facts from Supabase + asks Google Gemini to answer,
   then logs the visit back into Supabase
```

**In one line:** GitHub = the plans · Vercel = the running business ·
Supabase = the memory · Gemini = the rented brain.

---

## Why this setup is convenient

- **Low maintenance** — there's no server to manage by hand. Vercel rebuilds
  automatically on every push; Supabase quietly retains the data.
- **Safe to experiment** — because GitHub keeps every version, any change can be
  reviewed or rolled back.
- **Clear separation** — if you ever want to know "where does X live?", the
  answer is almost always one of: the code (GitHub), the live site (Vercel), or
  the stored data (Supabase).

## Quick reference

| Thing | Where it lives | How you reach it |
|---|---|---|
| Website code & history | GitHub | `github.com/HotWings101/matt-denzin-resume` |
| Live site, domain, settings, deploys | Vercel | `vercel.com` → project `matt-denzin-resume` |
| Stored data (analytics, chat, knowledge) | Supabase | `supabase.com` → project `matt-denzin-resume` |
| AI model | Google Gemini | Google AI Studio (API key) |
| The live website | — | https://matthewdenzin.ai |
| Private analytics dashboard | served by Vercel | https://matthewdenzin.ai/admin |
