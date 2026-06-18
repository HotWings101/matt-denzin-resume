# Visitor Analytics Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bot detection, new/returning classification, traffic-source, high-intent, and engagement-quality signals to the admin analytics dashboard — all computed at read time from existing data.

**Architecture:** A new pure, I/O-free module `src/lib/bot-detection.ts` holds all classification logic (unit-tested with Vitest). The data layer (`src/lib/visitors.ts`, `src/lib/analytics.ts`) calls into it and enriches the objects it returns. The admin UI (`src/components/admin/`) renders the new signals, defaults to humans-only, and exposes a "show bots" toggle. No DB migration, no new tracking, no new runtime dependency.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Supabase (service-role reads), Tailwind v4, lucide-react. Vitest (new dev dependency) for unit tests.

## Global Constraints

- No database schema changes / migrations.
- No new tracking code or changes to client-side capture.
- No new **runtime** dependencies. Vitest is **dev-only**.
- No IP-intelligence / third-party bot service.
- No unrelated refactoring.
- Path alias: `@/*` → `./src/*`.
- All classification functions are **pure and total** — never throw; missing/unknown inputs degrade to `human` / `Direct` / score `0`.
- Bot threshold: heuristic score **≥ 3** ⇒ `likely-bot`. A known bot user-agent ⇒ `bot` (definitive). Any human action forces `human` (false-positive guard).
- Branch: `analytics-visitor-enrichment` (already created; spec already committed there).

---

### Task 1: Vitest test harness

**Files:**
- Modify: `package.json` (add `test` script + `vitest` devDependency)
- Create: `vitest.config.ts`
- Create: `src/lib/smoke.test.ts` (temporary — deleted at end of task)

**Interfaces:**
- Consumes: nothing.
- Produces: a working `npm test` command that resolves the `@/*` alias and runs `src/**/*.test.ts` in a Node environment.

- [ ] **Step 1: Install Vitest (dev-only)**

Run:
```bash
npm install -D vitest
```
Expected: `vitest` added under `devDependencies` in `package.json`.

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

- [ ] **Step 3: Add the `test` script**

In `package.json`, add to `"scripts"` (after `"lint": "eslint",`):
```json
    "test": "vitest run",
```

- [ ] **Step 4: Write a smoke test**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it and confirm it passes**

Run: `npm test`
Expected: PASS — `1 passed`.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm src/lib/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add Vitest harness for analytics classification logic"
```

---

### Task 2: Broaden bot user-agent detection in `crawlers.ts`

**Files:**
- Modify: `src/lib/crawlers.ts` (add `BOT_UA_PATTERNS` + `detectBotName`; keep existing `AI_CRAWLERS`/`detectAICrawler`/`logCrawlerVisit` untouched)
- Test: `src/lib/crawlers.test.ts`

**Interfaces:**
- Consumes: existing `detectAICrawler(ua: string | null): string | null`.
- Produces: `detectBotName(ua: string | null): string | null` — returns a bot name for AI crawlers, search engines, social/link previewers, SEO scrapers, headless/scripted clients, and uptime monitors; `null` for ordinary human browsers.

- [ ] **Step 1: Write the failing test**

Create `src/lib/crawlers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { detectBotName } from "./crawlers";

describe("detectBotName", () => {
  it("flags AI crawlers", () => {
    expect(detectBotName("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe("GPTBot");
  });
  it("flags search engines", () => {
    expect(detectBotName("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe("Googlebot");
    expect(detectBotName("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe("Bingbot");
  });
  it("flags social/link previewers", () => {
    expect(detectBotName("facebookexternalhit/1.1")).toBe("facebookexternalhit");
    expect(detectBotName("Slackbot-LinkExpanding 1.0")).toBe("Slackbot");
  });
  it("flags headless and scripted clients", () => {
    expect(detectBotName("Mozilla/5.0 HeadlessChrome/120")).toBe("HeadlessChrome");
    expect(detectBotName("curl/8.4.0")).toBe("curl");
    expect(detectBotName("python-requests/2.31.0")).toBe("python-requests");
  });
  it("returns null for ordinary browsers", () => {
    const chrome =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    expect(detectBotName(chrome)).toBeNull();
    expect(detectBotName(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- crawlers`
Expected: FAIL — `detectBotName` is not exported.

- [ ] **Step 3: Implement `detectBotName`**

Append to `src/lib/crawlers.ts` (after the existing `detectAICrawler` function, before `logCrawlerVisit`):
```ts
/**
 * Broader bot user-agent patterns (search engines, social/link previewers,
 * SEO scrapers, headless/scripted clients, uptime monitors). Kept here so
 * crawlers.ts remains the single source of bot UA patterns.
 */
const BOT_UA_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "Googlebot", re: /Googlebot|Google-InspectionTool|Storebot-Google/i },
  { name: "Bingbot", re: /bingbot|BingPreview/i },
  { name: "DuckDuckBot", re: /DuckDuckBot/i },
  { name: "YandexBot", re: /YandexBot/i },
  { name: "Baiduspider", re: /Baiduspider/i },
  { name: "Slackbot", re: /Slackbot|Slack-ImgProxy/i },
  { name: "facebookexternalhit", re: /facebookexternalhit|FacebookBot/i },
  { name: "Twitterbot", re: /Twitterbot/i },
  { name: "LinkedInBot", re: /LinkedInBot/i },
  { name: "Discordbot", re: /Discordbot/i },
  { name: "TelegramBot", re: /TelegramBot/i },
  { name: "WhatsApp", re: /WhatsApp/i },
  { name: "Pinterest", re: /Pinterest/i },
  { name: "redditbot", re: /redditbot/i },
  { name: "AhrefsBot", re: /AhrefsBot/i },
  { name: "SemrushBot", re: /SemrushBot/i },
  { name: "MJ12bot", re: /MJ12bot/i },
  { name: "DotBot", re: /DotBot/i },
  { name: "PetalBot", re: /PetalBot/i },
  { name: "DataForSeoBot", re: /DataForSeoBot/i },
  { name: "HeadlessChrome", re: /HeadlessChrome|Headless/i },
  { name: "PhantomJS", re: /PhantomJS/i },
  { name: "Playwright", re: /Playwright/i },
  { name: "Puppeteer", re: /Puppeteer/i },
  { name: "Lighthouse", re: /Lighthouse|Chrome-Lighthouse/i },
  { name: "curl", re: /\bcurl\//i },
  { name: "wget", re: /\bWget\b/i },
  { name: "python-requests", re: /python-requests|aiohttp|httpx/i },
  { name: "Go-http-client", re: /Go-http-client/i },
  { name: "Java", re: /\bJava\/\d/i },
  { name: "axios", re: /\baxios\//i },
  { name: "node-fetch", re: /node-fetch|undici/i },
  { name: "Scrapy", re: /Scrapy/i },
  { name: "UptimeRobot", re: /UptimeRobot/i },
  { name: "Pingdom", re: /Pingdom/i },
  { name: "monitoring", re: /StackdriverMonitoring|GoogleHC|HealthCheck/i },
  { name: "Vercel", re: /vercel-screenshot|vercel-favicon|Vercelbot/i },
  { name: "bot-generic", re: /\bbot\b|crawler|spider|crawl/i },
];

/** Returns a bot name if the UA matches any known AI/search/social/scraper/headless pattern, else null. */
export function detectBotName(ua: string | null): string | null {
  if (!ua) return null;
  const ai = detectAICrawler(ua);
  if (ai) return ai;
  for (const b of BOT_UA_PATTERNS) if (b.re.test(ua)) return b.name;
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- crawlers`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/crawlers.ts src/lib/crawlers.test.ts
git commit -m "feat: broaden bot user-agent detection (detectBotName)"
```

---

### Task 3: `classifyBot` heuristic + UA scoring

**Files:**
- Create: `src/lib/bot-detection.ts`
- Test: `src/lib/bot-detection.test.ts`

**Interfaces:**
- Consumes: `detectBotName` from `./crawlers`.
- Produces:
  ```ts
  export type BotVerdict = "human" | "likely-bot" | "bot";
  export interface BotSignals {
    userAgent: string | null;
    country: string | null;
    city: string | null;
    durationMs: number;
    activeMs: number;
    maxScroll: number;   // percent 0-100
    pageViews: number;
    eventsCount: number;
    humanAction: boolean; // caller-derived: did a real person clearly act this session?
  }
  export function classifyBot(s: BotSignals): { verdict: BotVerdict; reasons: string[] };
  ```

- [ ] **Step 1: Write the failing test**

Create `src/lib/bot-detection.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { classifyBot, type BotSignals } from "./bot-detection";

const base: BotSignals = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  country: "US",
  city: "Dallas",
  durationMs: 60000,
  activeMs: 45000,
  maxScroll: 100,
  pageViews: 2,
  eventsCount: 20,
  humanAction: true,
};

describe("classifyBot", () => {
  it("returns bot for a known bot UA", () => {
    const r = classifyBot({ ...base, userAgent: "GPTBot/1.0", humanAction: false });
    expect(r.verdict).toBe("bot");
    expect(r.reasons).toContain("GPTBot");
  });

  it("returns likely-bot for datacenter instant-bounce (Council Bluffs, 0s, no scroll)", () => {
    const r = classifyBot({
      ...base,
      city: "Council Bluffs",
      durationMs: 0,
      activeMs: 0,
      maxScroll: 0,
      pageViews: 1,
      eventsCount: 1,
      humanAction: false,
    });
    expect(r.verdict).toBe("likely-bot");
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it("returns likely-bot for US-only, 0s, no city (datacenter geo)", () => {
    const r = classifyBot({
      ...base,
      city: null,
      durationMs: 0,
      activeMs: 0,
      maxScroll: 0,
      pageViews: 1,
      eventsCount: 1,
      humanAction: false,
    });
    expect(r.verdict).toBe("likely-bot");
  });

  it("returns human for an engaged real visitor", () => {
    expect(classifyBot(base).verdict).toBe("human");
  });

  it("never flags a session with a human action, even with bot-ish metrics", () => {
    const r = classifyBot({
      ...base,
      city: null,
      durationMs: 0,
      activeMs: 0,
      maxScroll: 0,
      pageViews: 1,
      eventsCount: 1,
      humanAction: true,
    });
    expect(r.verdict).toBe("human");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- bot-detection`
Expected: FAIL — module/`classifyBot` not found.

- [ ] **Step 3: Implement `classifyBot`**

Create `src/lib/bot-detection.ts`:
```ts
import { detectBotName } from "./crawlers";

export type BotVerdict = "human" | "likely-bot" | "bot";

export interface BotSignals {
  userAgent: string | null;
  country: string | null;
  city: string | null;
  durationMs: number;
  activeMs: number;
  maxScroll: number;
  pageViews: number;
  eventsCount: number;
  humanAction: boolean;
}

/** Hyperscaler data-center towns — a strong "this is a server, not a person" tell. */
const DATACENTER_CITIES = new Set([
  "Council Bluffs",
  "The Dalles",
  "Boardman",
  "Ashburn",
  "Boydton",
  "Moncks Corner",
  "Quincy",
]);

/**
 * Classify a session as human / likely-bot / bot.
 * - A known bot user-agent is definitive ("bot").
 * - Any clear human action forces "human" (false-positive guard).
 * - Otherwise a heuristic score >= 3 yields "likely-bot".
 */
export function classifyBot(s: BotSignals): { verdict: BotVerdict; reasons: string[] } {
  const botName = detectBotName(s.userAgent);
  if (botName) return { verdict: "bot", reasons: [botName] };

  if (s.humanAction) return { verdict: "human", reasons: [] };

  let score = 0;
  const reasons: string[] = [];

  if (s.activeMs === 0 && s.maxScroll === 0) {
    score += 2;
    reasons.push("0s · no scroll");
  }
  if (s.pageViews <= 1 && s.durationMs < 1000) {
    score += 1;
    reasons.push("instant exit");
  }
  if (s.country && !s.city) {
    score += 1;
    reasons.push("no city (datacenter)");
  }
  if (s.eventsCount <= 1) {
    score += 1;
    reasons.push("≤1 event");
  }
  if (s.city && DATACENTER_CITIES.has(s.city)) {
    score += 1;
    reasons.push(`datacenter: ${s.city}`);
  }

  if (score >= 3) return { verdict: "likely-bot", reasons };
  return { verdict: "human", reasons: [] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- bot-detection`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bot-detection.ts src/lib/bot-detection.test.ts
git commit -m "feat: classifyBot heuristic (UA + behavioral scoring)"
```

---

### Task 4: `classifySource` traffic-source classification

**Files:**
- Modify: `src/lib/bot-detection.ts` (add `TrafficSource` type + `classifySource`)
- Test: `src/lib/bot-detection.test.ts` (add a `describe` block)

**Interfaces:**
- Produces:
  ```ts
  export type TrafficSource =
    | "Direct" | "Google Search" | "LinkedIn" | "Social" | "Job board" | "Referral";
  export function classifySource(referrer: string | null, utmSource: string | null): TrafficSource;
  ```

- [ ] **Step 1: Write the failing test**

Add to `src/lib/bot-detection.test.ts`:
```ts
import { classifySource } from "./bot-detection";

describe("classifySource", () => {
  it("buckets by referrer host", () => {
    expect(classifySource("https://www.google.com/", null)).toBe("Google Search");
    expect(classifySource("https://www.linkedin.com/feed/", null)).toBe("LinkedIn");
    expect(classifySource("https://t.co/abc", null)).toBe("Social");
    expect(classifySource("https://www.indeed.com/job", null)).toBe("Job board");
    expect(classifySource("https://someblog.dev/post", null)).toBe("Referral");
  });
  it("returns Direct when there is no referrer or UTM", () => {
    expect(classifySource(null, null)).toBe("Direct");
    expect(classifySource("", null)).toBe("Direct");
  });
  it("falls back to UTM when referrer is absent", () => {
    expect(classifySource(null, "linkedin")).toBe("LinkedIn");
    expect(classifySource(null, "newsletter")).toBe("Referral");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- bot-detection`
Expected: FAIL — `classifySource` not exported.

- [ ] **Step 3: Implement `classifySource`**

Append to `src/lib/bot-detection.ts`:
```ts
export type TrafficSource =
  | "Direct"
  | "Google Search"
  | "LinkedIn"
  | "Social"
  | "Job board"
  | "Referral";

function hostOf(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function sourceFromHost(h: string): TrafficSource | null {
  if (/google\.|bing\.|duckduckgo\.|yahoo\.|ecosia\.|brave\.|search\./.test(h))
    return "Google Search";
  if (h.includes("linkedin.")) return "LinkedIn";
  if (/twitter\.|x\.com|t\.co|facebook\.|fb\.|instagram\.|reddit\.|youtube\.|ycombinator|mastodon/.test(h))
    return "Social";
  if (/indeed\.|glassdoor\.|ziprecruiter\.|dice\.|monster\.|lever\.co|greenhouse|wellfound|angellist/.test(h))
    return "Job board";
  return null;
}

/** Classify a visit's traffic source from referrer host (preferred) or utm_source. */
export function classifySource(
  referrer: string | null,
  utmSource: string | null,
): TrafficSource {
  const host = hostOf(referrer);
  if (host) return sourceFromHost(host) ?? "Referral";

  if (utmSource) {
    const u = utmSource.toLowerCase();
    if (u.includes("linkedin")) return "LinkedIn";
    if (/google|bing|duckduckgo|yahoo|search/.test(u)) return "Google Search";
    if (/twitter|facebook|instagram|reddit|youtube|social|x\.com/.test(u)) return "Social";
    if (/indeed|glassdoor|ziprecruiter|dice|monster|lever|greenhouse|job/.test(u)) return "Job board";
    return "Referral";
  }
  return "Direct";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- bot-detection`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bot-detection.ts src/lib/bot-detection.test.ts
git commit -m "feat: classifySource traffic-source classification"
```

---

### Task 5: Session scoring helpers (`classifyIntent`, `engagementScore`, `classifyVisitorType`)

**Files:**
- Modify: `src/lib/bot-detection.ts`
- Test: `src/lib/bot-detection.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface IntentSignals {
    hasChat: boolean; hasJd: boolean; hasContact: boolean; hasResumeDownload: boolean;
    viewedExperience: boolean; maxScroll: number; activeMs: number;
  }
  export function classifyIntent(s: IntentSignals): { highIntent: boolean; reasons: string[] };

  export interface EngagementSignals {
    activeMs: number; maxScroll: number; pageViews: number; interactions: number;
  }
  export function engagementScore(s: EngagementSignals): number; // 0-100

  export function classifyVisitorType(
    isFirstSession: boolean, totalVisits: number,
  ): { type: "new" | "returning"; visitCount: number };
  ```

- [ ] **Step 1: Write the failing test**

Add to `src/lib/bot-detection.test.ts`:
```ts
import { classifyIntent, engagementScore, classifyVisitorType } from "./bot-detection";

describe("classifyIntent", () => {
  const none = {
    hasChat: false, hasJd: false, hasContact: false, hasResumeDownload: false,
    viewedExperience: false, maxScroll: 10, activeMs: 1000,
  };
  it("flags high intent on a high-value action", () => {
    const r = classifyIntent({ ...none, hasResumeDownload: true });
    expect(r.highIntent).toBe(true);
    expect(r.reasons).toContain("Downloaded resume");
  });
  it("flags high intent on a full read", () => {
    expect(classifyIntent({ ...none, maxScroll: 100, activeMs: 40000 }).highIntent).toBe(true);
  });
  it("is low intent for a shallow visit", () => {
    expect(classifyIntent(none).highIntent).toBe(false);
  });
});

describe("engagementScore", () => {
  it("scores an idle bounce near zero", () => {
    expect(engagementScore({ activeMs: 0, maxScroll: 0, pageViews: 1, interactions: 0 }))
      .toBeLessThanOrEqual(5);
  });
  it("scores a deep engaged visit near 100", () => {
    expect(engagementScore({ activeMs: 120000, maxScroll: 100, pageViews: 3, interactions: 2 }))
      .toBe(100);
  });
  it("clamps to 0-100", () => {
    const v = engagementScore({ activeMs: 9_999_999, maxScroll: 999, pageViews: 99, interactions: 99 });
    expect(v).toBeLessThanOrEqual(100);
    expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe("classifyVisitorType", () => {
  it("marks the first session new", () => {
    expect(classifyVisitorType(true, 1)).toEqual({ type: "new", visitCount: 1 });
  });
  it("marks later sessions returning with a visit count", () => {
    expect(classifyVisitorType(false, 4)).toEqual({ type: "returning", visitCount: 4 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- bot-detection`
Expected: FAIL — helpers not exported.

- [ ] **Step 3: Implement the helpers**

Append to `src/lib/bot-detection.ts`:
```ts
export interface IntentSignals {
  hasChat: boolean;
  hasJd: boolean;
  hasContact: boolean;
  hasResumeDownload: boolean;
  viewedExperience: boolean;
  maxScroll: number;
  activeMs: number;
}

/** Flag recruiter / high-intent behavior. Any single high-value action qualifies. */
export function classifyIntent(s: IntentSignals): { highIntent: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (s.hasResumeDownload) reasons.push("Downloaded resume");
  if (s.hasContact) reasons.push("Contacted");
  if (s.hasJd) reasons.push("Ran JD-Fit");
  if (s.hasChat) reasons.push("Chatted");
  if (s.viewedExperience) reasons.push("Viewed experience");
  if (s.maxScroll >= 100 && s.activeMs >= 30000) reasons.push("Read fully");
  return { highIntent: reasons.length > 0, reasons };
}

export interface EngagementSignals {
  activeMs: number;
  maxScroll: number;
  pageViews: number;
  interactions: number;
}

/**
 * 0-100 engagement quality. Active time (cap 2m) 40pts, scroll 30pts,
 * page views (cap 3) 10pts, interactions (cap 2) 20pts.
 */
export function engagementScore(s: EngagementSignals): number {
  const active = Math.min(Math.max(s.activeMs, 0) / 120000, 1) * 40;
  const scroll = Math.min(Math.max(s.maxScroll, 0) / 100, 1) * 30;
  const pages = Math.min(Math.max(s.pageViews, 0) / 3, 1) * 10;
  const interactions = Math.min(Math.max(s.interactions, 0) / 2, 1) * 20;
  return Math.round(Math.min(active + scroll + pages + interactions, 100));
}

/** New vs returning, plus the visitor's total visit count (>= 1). */
export function classifyVisitorType(
  isFirstSession: boolean,
  totalVisits: number,
): { type: "new" | "returning"; visitCount: number } {
  return {
    type: isFirstSession ? "new" : "returning",
    visitCount: Math.max(totalVisits, 1),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- bot-detection`
Expected: PASS — all bot-detection tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bot-detection.ts src/lib/bot-detection.test.ts
git commit -m "feat: intent, engagement, and visitor-type classifiers"
```

---

### Task 6: Enrich `getRecentVisitorSessions` (`visitors.ts`)

**Files:**
- Modify: `src/lib/visitors.ts`

**Interfaces:**
- Consumes: `classifyBot`, `classifySource`, `classifyIntent`, `engagementScore`, `classifyVisitorType`, `BotVerdict`, `TrafficSource` from `@/lib/bot-detection`.
- Produces: an extended `VisitorSession` with `botVerdict`, `botReasons`, `visitorType`, `visitCount`, `source`, `highIntent`, `intentReasons`, `engagement`.

- [ ] **Step 1: Add classification imports**

At the top of `src/lib/visitors.ts`, below the existing import line `import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";`, add:
```ts
import {
  classifyBot,
  classifySource,
  classifyIntent,
  engagementScore,
  classifyVisitorType,
  type BotVerdict,
  type TrafficSource,
} from "@/lib/bot-detection";
```

- [ ] **Step 2: Extend the `VisitorSession` interface**

In `src/lib/visitors.ts`, add these fields to the `VisitorSession` interface (immediately after `contact: { name: string; email: string; message: string } | null;`):
```ts
  // --- derived classification (read-time) ---
  botVerdict: BotVerdict;
  botReasons: string[];
  visitorType: "new" | "returning";
  visitCount: number;
  source: TrafficSource;
  highIntent: boolean;
  intentReasons: string[];
  engagement: number; // 0-100
```

- [ ] **Step 3: Add `user_agent` + `utm_source` to the `SessionRow` type**

In the `SessionRow` interface, add these two lines after `exit_path: string | null;`:
```ts
  user_agent: string | null;
  utm_source: string | null;
```

- [ ] **Step 4: Select the new columns**

In `getRecentVisitorSessions`, change the sessions `.select(...)` string from:
```ts
        "id,visitor_id,first_seen,duration_ms,active_ms,page_views,events_count,max_scroll,bounced,device,browser,os,country,region,city,referrer,entry_path,exit_path",
```
to:
```ts
        "id,visitor_id,first_seen,duration_ms,active_ms,page_views,events_count,max_scroll,bounced,device,browser,os,country,region,city,referrer,entry_path,exit_path,user_agent,utm_source",
```

- [ ] **Step 5: Query all-time visit counts per visitor**

In `getRecentVisitorSessions`, immediately after the block that computes `visitorIds` (the `const visitorIds = [ ... ];` statement), add:
```ts
    // All-time session timestamps per visitor → new/returning + visit count.
    const visitsByVisitor = new Map<string, string[]>(); // visitorId -> first_seen[]
    if (visitorIds.length > 0) {
      const allRes = await supabase
        .from("sessions")
        .select("visitor_id,first_seen")
        .in("visitor_id", visitorIds)
        .limit(10000);
      for (const r of (allRes.data ?? []) as { visitor_id: string | null; first_seen: string | null }[]) {
        if (!r.visitor_id || !r.first_seen) continue;
        const arr = visitsByVisitor.get(r.visitor_id) ?? [];
        arr.push(r.first_seen);
        visitsByVisitor.set(r.visitor_id, arr);
      }
    }
```

- [ ] **Step 6: Compute and attach classifications in the assembly map**

In the final `return sessionRows.map((s) => { ... })`, replace the whole map callback body with this (it keeps every existing field and adds the derived ones):
```ts
    return sessionRows.map((s) => {
      const vId = s.visitor_id;
      const journey = journeyBySession.get(s.id) ?? [];
      const conversation = (vId && conversationByVisitor.get(vId)) || [];
      const jd = (vId && jdByVisitor.get(vId)) || [];
      const contact = (vId && contactByVisitor.get(vId)) || null;

      const durationMs = s.duration_ms ?? 0;
      const activeMs = s.active_ms ?? 0;
      const maxScroll = s.max_scroll ?? 0;

      const hasChat = conversation.length > 0;
      const hasJd = jd.length > 0;
      const hasContact = Boolean(contact);
      const hasResumeDownload = journey.some((e) => e.type === "resume_download");
      const viewedExperience =
        s.entry_path === "/experience" ||
        s.exit_path === "/experience" ||
        journey.some(
          (e) => e.type === "page_view" && String(e.meta?.path ?? "") === "/experience",
        );

      const humanAction =
        hasChat ||
        hasJd ||
        hasContact ||
        hasResumeDownload ||
        (maxScroll > 50 && activeMs >= 10000);

      const interactions = [hasChat, hasJd, hasContact, hasResumeDownload].filter(
        Boolean,
      ).length;

      const bot = classifyBot({
        userAgent: s.user_agent,
        country: s.country,
        city: s.city,
        durationMs,
        activeMs,
        maxScroll,
        pageViews: s.page_views ?? 0,
        eventsCount: s.events_count ?? 0,
        humanAction,
      });

      const visits = (vId && visitsByVisitor.get(vId)) || [];
      const totalVisits = visits.length || 1;
      const thisStart = s.first_seen ?? "";
      const isFirstSession = !visits.some((ts) => ts < thisStart);
      const visitorType = classifyVisitorType(isFirstSession, totalVisits);

      const intent = classifyIntent({
        hasChat,
        hasJd,
        hasContact,
        hasResumeDownload,
        viewedExperience,
        maxScroll,
        activeMs,
      });

      return {
        sessionId: s.id,
        visitorId: vId,
        startedAt: s.first_seen ?? "",
        durationSec: msToSec(s.duration_ms),
        activeSec: msToSec(s.active_ms),
        pageViews: s.page_views ?? 0,
        maxScroll,
        bounced: Boolean(s.bounced),
        eventsCount: s.events_count ?? 0,
        device: s.device,
        browser: s.browser,
        os: s.os,
        country: s.country,
        region: s.region,
        city: s.city,
        referrer: s.referrer,
        entryPath: s.entry_path,
        exitPath: s.exit_path,
        journey,
        conversation,
        jd,
        contact,
        botVerdict: bot.verdict,
        botReasons: bot.reasons,
        visitorType: visitorType.type,
        visitCount: visitorType.visitCount,
        source: classifySource(s.referrer, s.utm_source),
        highIntent: intent.highIntent,
        intentReasons: intent.reasons,
        engagement: engagementScore({
          activeMs,
          maxScroll,
          pageViews: s.page_views ?? 0,
          interactions,
        }),
      };
    });
```

- [ ] **Step 7: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors. (If `e.meta?.path` errors on the `Record<string, unknown>` type, it should not — `meta` is `Record<string, unknown>` so `e.meta?.path` is valid and `String(...)` coerces it.)

- [ ] **Step 8: Commit**

```bash
git add src/lib/visitors.ts
git commit -m "feat: enrich visitor sessions with bot/type/source/intent/engagement"
```

---

### Task 7: Humans-only totals + summary + traffic sources (`analytics.ts`)

**Files:**
- Modify: `src/lib/analytics.ts`

**Interfaces:**
- Consumes: `classifyBot`, `classifySource` from `@/lib/bot-detection`.
- Produces: `AnalyticsData` gains `summary` and `trafficSources`; `totals` (uniqueVisitors, sessions, bounceRate, avgDurationSec, avgActiveSec, pageViews) recomputed humans-only.
  ```ts
  summary: {
    humans: number; bots: number;
    newVisitors: number; returningVisitors: number; returningRate: number;
  };
  trafficSources: Counted[];
  ```

- [ ] **Step 1: Add the import**

At the top of `src/lib/analytics.ts`, below `import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";`, add:
```ts
import { classifyBot, classifySource } from "@/lib/bot-detection";
```

- [ ] **Step 2: Extend the `AnalyticsData` interface**

In `src/lib/analytics.ts`, add to the `AnalyticsData` interface immediately after the `totals: { ... };` block:
```ts
  summary: {
    humans: number;
    bots: number;
    newVisitors: number;
    returningVisitors: number;
    returningRate: number;
  };
  trafficSources: Counted[];
```

- [ ] **Step 3: Update the `EMPTY` constant**

In the `EMPTY: AnalyticsData` object, add immediately after the `totals: { ... },` block:
```ts
  summary: {
    humans: 0,
    bots: 0,
    newVisitors: 0,
    returningVisitors: 0,
    returningRate: 0,
  },
  trafficSources: [],
```

- [ ] **Step 4: Select the columns needed for classification**

In `getAnalytics`, change the sessions query `.select(...)` from:
```ts
      supabase.from("sessions").select("visitor_id,duration_ms,active_ms,bounced,device,browser,country,referrer").gte("created_at", since).limit(8000),
```
to:
```ts
      supabase.from("sessions").select("visitor_id,duration_ms,active_ms,bounced,device,browser,country,city,referrer,user_agent,utm_source,max_scroll,page_views,events_count").gte("created_at", since).limit(8000),
```

- [ ] **Step 5: Widen the `sessions` row type**

Replace the `const sessions = (sessionsRes.data ?? []) as Array<{ ... }>;` type annotation with:
```ts
    const sessions = (sessionsRes.data ?? []) as Array<{
      visitor_id: string | null;
      duration_ms: number | null;
      active_ms: number | null;
      bounced: boolean | null;
      device: string | null;
      browser: string | null;
      country: string | null;
      city: string | null;
      referrer: string | null;
      user_agent: string | null;
      utm_source: string | null;
      max_scroll: number | null;
      page_views: number | null;
      events_count: number | null;
    }>;
```

- [ ] **Step 6: Partition sessions into humans vs bots and recompute totals**

Replace the block that starts at `const sessionCount = sessions.length;` and ends with the `avgActiveSec` computation (the 5 statements computing `sessionCount`, `bounced`, `bounceRate`, `avgDurationSec`, `avgActiveSec`) with:
```ts
    // Classify each session; headline stats count humans only.
    const isHuman = (s: (typeof sessions)[number]): boolean =>
      classifyBot({
        userAgent: s.user_agent,
        country: s.country,
        city: s.city,
        durationMs: s.duration_ms ?? 0,
        activeMs: s.active_ms ?? 0,
        maxScroll: s.max_scroll ?? 0,
        pageViews: s.page_views ?? 0,
        eventsCount: s.events_count ?? 0,
        humanAction: !s.bounced, // engaged sessions are treated as human
      }).verdict === "human";

    const humanSessions = sessions.filter(isHuman);
    const botCount = sessions.length - humanSessions.length;

    const sessionCount = humanSessions.length;
    const bounced = humanSessions.filter((s) => s.bounced).length;
    const bounceRate = sessionCount ? Math.round((bounced / sessionCount) * 100) : 0;
    const avgDurationSec = sessionCount
      ? Math.round(humanSessions.reduce((a, s) => a + (s.duration_ms ?? 0), 0) / sessionCount / 1000)
      : 0;
    const avgActiveSec = sessionCount
      ? Math.round(humanSessions.reduce((a, s) => a + (s.active_ms ?? 0), 0) / sessionCount / 1000)
      : 0;

    // New vs returning (within this period): visitors with >1 human session are returning.
    const sessionsPerVisitor = new Map<string, number>();
    for (const s of humanSessions) {
      if (!s.visitor_id) continue;
      sessionsPerVisitor.set(s.visitor_id, (sessionsPerVisitor.get(s.visitor_id) ?? 0) + 1);
    }
    let newVisitors = 0;
    let returningVisitors = 0;
    for (const count of sessionsPerVisitor.values()) {
      if (count > 1) returningVisitors++;
      else newVisitors++;
    }
    const totalKnown = newVisitors + returningVisitors;
    const returningRate = totalKnown
      ? Math.round((returningVisitors / totalKnown) * 100)
      : 0;

    const humanPageViews = humanSessions.reduce((a, s) => a + (s.page_views ?? 0), 0);
    const humanUniqueVisitors = new Set(
      humanSessions.map((s) => s.visitor_id).filter(Boolean),
    ).size;

    const trafficSources = tally(
      humanSessions.map((s) => classifySource(s.referrer, s.utm_source)),
    );
```

- [ ] **Step 7: Point the aggregate lists at human sessions**

Replace these four lines:
```ts
    const topReferrers = tally(sessions.map((s) => refHost(s.referrer)), 10);
    const devices = tally(sessions.map((s) => s.device), 6);
    const browsers = tally(sessions.map((s) => s.browser), 8);
    const countries = tally(sessions.map((s) => s.country), 12);
```
with:
```ts
    const topReferrers = tally(humanSessions.map((s) => refHost(s.referrer)), 10);
    const devices = tally(humanSessions.map((s) => s.device), 6);
    const browsers = tally(humanSessions.map((s) => s.browser), 8);
    const countries = tally(humanSessions.map((s) => s.country), 12);
```

- [ ] **Step 8: Update the returned `totals` + add new sections**

In the `return { ... }` object, change the `totals` block fields `pageViews`, `uniqueVisitors`, and leave `sessions` referencing the now-humans-only `sessionCount`:
```ts
      totals: {
        pageViews: humanPageViews,
        uniqueVisitors: humanUniqueVisitors,
        sessions: sessionCount,
        bounceRate,
        avgDurationSec,
        avgActiveSec,
        chatQuestions: chatQCount.count ?? 0,
        jdAnalyses: jdCount.count ?? 0,
        contacts: contactCount.count ?? 0,
      },
```
Then add, immediately after the `totals: { ... },` block in the return object:
```ts
      summary: {
        humans: humanSessions.length,
        bots: botCount,
        newVisitors,
        returningVisitors,
        returningRate,
      },
      trafficSources,
```
Note: the `uniqueVisitors` const previously derived from page_view events is now unused for totals but is still used to build `daily`. Leave the `const uniqueVisitors = ...` line and the `daily` computation as-is (daily remains event-based by design).

- [ ] **Step 9: Verify type-check and tests**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm test`
Expected: PASS (existing classifier tests still green).

- [ ] **Step 10: Commit**

```bash
git add src/lib/analytics.ts
git commit -m "feat: humans-only totals, summary cards, traffic-source breakdown"
```

---

### Task 8: Dashboard UI — badges, humans-only default, toggle, summary cards, sources panel

**Files:**
- Modify: `src/components/admin/visitors.tsx`
- Modify: `src/components/admin/dashboard.tsx`

**Interfaces:**
- Consumes: enriched `VisitorSession` (Task 6) and `AnalyticsData.summary` / `.trafficSources` (Task 7).
- Produces: humans-only Visitors list with a "show bots" toggle and per-row badges; summary stat cards above the list; a "Traffic sources" panel in the Audience tab.

- [ ] **Step 1: Add badge rendering + bot toggle to `visitors.tsx`**

In `src/components/admin/visitors.tsx`, replace the entire `VisitorsTab` function with:
```tsx
export function VisitorsTab({ sessions }: { sessions: VisitorSession[] }) {
  const [showBots, setShowBots] = useState(false);

  const ordered = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const humans = ordered.filter((s) => s.botVerdict === "human");
  const bots = ordered.filter((s) => s.botVerdict !== "human");
  const visible = showBots ? ordered : humans;

  return (
    <Panel
      title={`Visitors (${humans.length})`}
      action={
        bots.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowBots((v) => !v)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            {showBots ? "Hide bots" : `Show bots (${bots.length})`}
          </button>
        ) : undefined
      }
    >
      {visible.length === 0 ? (
        <p className="text-sm text-muted">No visitor sessions yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((s) => (
            <SessionRow key={s.sessionId} session={s} />
          ))}
        </ul>
      )}
    </Panel>
  );
}
```

- [ ] **Step 2: Render the new badges inside `SessionRow`**

In `src/components/admin/visitors.tsx`, inside `SessionRow`, locate the visitor-id block:
```tsx
        <div className="min-w-0 basis-44 shrink-0">
          <p className="truncate font-mono text-sm text-foreground">
            {visitorLabel}
          </p>
          <p className="mt-0.5 font-mono text-[0.68rem] text-faint">
            {relativeTime(s.startedAt)}
          </p>
        </div>
```
Replace it with:
```tsx
        <div className="min-w-0 basis-48 shrink-0">
          <p className="flex items-center gap-1.5 truncate font-mono text-sm text-foreground">
            {visitorLabel}
            {s.botVerdict !== "human" ? (
              <span
                title={s.botReasons.join(" · ")}
                className="rounded-full bg-clay/10 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-clay"
              >
                {s.botVerdict === "bot" ? "Bot" : "Likely bot"}
              </span>
            ) : s.visitorType === "returning" ? (
              <span className="rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-accent-strong">
                Return ×{s.visitCount}
              </span>
            ) : (
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-muted">
                New
              </span>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-2 font-mono text-[0.68rem] text-faint">
            {relativeTime(s.startedAt)}
            <span className="text-muted">· {s.source}</span>
            {s.highIntent && (
              <span title={s.intentReasons.join(" · ")} className="text-accent">
                ★ intent
              </span>
            )}
          </p>
        </div>
```

- [ ] **Step 3: Show the engagement score next to the engagement badge**

In `SessionRow`, find the duration/scroll/pageViews `<div className="ml-auto ...">` group and add an engagement-score chip. Replace:
```tsx
          <span className="inline-flex items-center gap-1 text-faint">
            <Eye className="size-3.5" />
            {s.pageViews}
          </span>
        </div>
```
with:
```tsx
          <span className="inline-flex items-center gap-1 text-faint">
            <Eye className="size-3.5" />
            {s.pageViews}
          </span>
          <span
            title="Engagement quality (0-100)"
            className="inline-flex items-center gap-1 text-faint"
          >
            <Gauge className="size-3.5" />
            {s.engagement}
          </span>
        </div>
```
Then add `Gauge` to the lucide-react import at the top of the file (append `Gauge,` to the existing import list from `"lucide-react"`).

- [ ] **Step 4: Type-check the UI**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Add summary cards above the Visitors list in `dashboard.tsx`**

In `src/components/admin/dashboard.tsx`, replace the visitors tab line:
```tsx
      {tab === "visitors" && <VisitorsTab sessions={visitors} />}
```
with:
```tsx
      {tab === "visitors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Humans" value={data.summary.humans} />
            <StatCard label="Bots filtered" value={data.summary.bots} />
            <StatCard
              label="New / Returning"
              value={`${data.summary.newVisitors} / ${data.summary.returningVisitors}`}
              sub="this period"
            />
            <StatCard
              label="Returning rate"
              value={`${data.summary.returningRate}%`}
              accent
            />
          </div>
          <VisitorsTab sessions={visitors} />
        </div>
      )}
```

- [ ] **Step 6: Add the Traffic sources panel to the Audience tab**

In `src/components/admin/dashboard.tsx`, inside the `Audience` function's grid, add a new panel immediately after the `</Panel>` that closes "Referrers" (i.e. after the `<Panel title="Referrers">...</Panel>` block):
```tsx
      <Panel title="Traffic sources">
        <BarList items={data.trafficSources} emptyLabel="No traffic-source data yet." />
      </Panel>
```

- [ ] **Step 7: Type-check, lint, and build**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run lint`
Expected: no errors.
Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/visitors.tsx src/components/admin/dashboard.tsx
git commit -m "feat: dashboard bot toggle, visitor badges, summary cards, sources panel"
```

---

### Task 9: Full verification + branch finishing

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all classifier tests green.

- [ ] **Step 2: Type-check, lint, build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all succeed with no errors.

- [ ] **Step 3: Manual smoke test against real data**

Run: `npm run dev`, open `http://localhost:3000/admin?range=7` (sign in if prompted), and confirm on the **Visitors** tab:
- Summary cards show Humans / Bots filtered / New-Returning / Returning rate.
- The list defaults to humans only; the `Council Bluffs` and `0s / 0% / US-only` rows are gone from the default view.
- `Show bots (N)` reveals them, each tagged `Bot` / `Likely bot` with a hover reason.
- Returning visitors (e.g. the repeated `v_…` ids) show `Return ×N`; first-timers show `New`.
- Each row shows a traffic source, an engagement number, and `★ intent` where applicable.
- The **Audience** tab shows the new "Traffic sources" panel.

Document any mismatch and fix before finishing. (If running locally with no Supabase env, the dashboard shows empty data — verify against the deployed env or seeded data instead.)

- [ ] **Step 4: Finish the branch**

Invoke the `superpowers:finishing-a-development-branch` skill to choose how to integrate (merge / PR / cleanup).

---

## Self-Review

**Spec coverage:**
- "Distinguish unique visitors / New vs Returning ×N" → Tasks 5 (`classifyVisitorType`), 6 (all-time visit query + badges), 8 (row badge). ✓
- "Detect & flag likely bots; default humans-only with reveal toggle; nothing deleted" → Tasks 2–3 (detection), 6/7 (flagging), 8 (toggle, default humans). ✓
- "Human-override false-positive guard" → Task 3 + Task 6 `humanAction` derivation. ✓
- "Traffic source" → Tasks 4, 6, 8 (panel + row chip). ✓
- "High-intent / recruiter badge" → Tasks 5, 6, 8. ✓
- "Engagement quality score" → Tasks 5, 6, 8. ✓
- "Summary cards (humans vs bots, new vs returning, returning rate)" → Tasks 7, 8. ✓
- "Humans-only headline totals" → Task 7. ✓
- "Read-time, no migration, no new tracking, no new runtime deps, Vitest dev-only" → enforced throughout; Vitest added in Task 1 as devDependency. ✓
- "Pure, total, never-throw classifiers; tested with real-data fixtures" → Tasks 2–5 (Council Bluffs, v_labl9gxn, GPTBot/Googlebot/headless fixtures). ✓

**Placeholder scan:** No "TBD"/"implement later"/vague-error steps. The only intentional placeholder line (`duration_ms_raw`) is explicitly created-then-deleted in Task 6 Step 3 to guard against stray fields. All code steps contain complete code.

**Type consistency:** `BotVerdict`, `TrafficSource`, `classifyBot`, `classifySource`, `classifyIntent`, `engagementScore`, `classifyVisitorType` signatures are identical across the producing task (3–5) and the consuming tasks (6–8). `VisitorSession` new field names (`botVerdict`, `botReasons`, `visitorType`, `visitCount`, `source`, `highIntent`, `intentReasons`, `engagement`) match exactly between Task 6 (definition) and Task 8 (usage). `AnalyticsData.summary`/`trafficSources` match between Task 7 (definition) and Task 8 (usage).

**Known, documented approximations** (acceptable, noted in the spec/plan): `daily` chart stays event-based (includes bot page-views); chat/JD/contact are visitor-scoped not session-scoped (consistent with existing UI); summary new/returning is window-scoped while per-row badges are all-time.
