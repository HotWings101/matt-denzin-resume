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
