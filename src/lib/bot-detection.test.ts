import { describe, it, expect } from "vitest";
import {
  classifyBot,
  type BotSignals,
  classifySource,
  classifyIntent,
  engagementScore,
  classifyVisitorType,
} from "./bot-detection";

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
  it("treats our own domains as Direct (self-referral), not Referral", () => {
    expect(classifySource("https://matthewdenzin.ai/experience", null)).toBe("Direct");
    expect(classifySource("https://matthewdenzin.com/", null)).toBe("Direct");
    expect(classifySource("https://matt-denzin-resume.vercel.app/", null)).toBe("Direct");
  });
});

describe("classifyIntent", () => {
  const none = {
    hasChat: false,
    hasJd: false,
    hasContact: false,
    hasResumeDownload: false,
    viewedExperience: false,
    maxScroll: 10,
    activeMs: 1000,
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
