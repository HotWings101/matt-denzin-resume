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
