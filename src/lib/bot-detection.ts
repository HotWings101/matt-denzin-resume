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
