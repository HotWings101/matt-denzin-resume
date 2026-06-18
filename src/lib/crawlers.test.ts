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
