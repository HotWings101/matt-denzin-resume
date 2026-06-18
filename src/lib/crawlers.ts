/**
 * AI/LLM crawler detection + logging. Runs in middleware (edge), so it uses a
 * raw fetch to the Supabase REST API (no node-only supabase-js client).
 */
const AI_CRAWLERS: { name: string; re: RegExp }[] = [
  { name: "GPTBot", re: /GPTBot/i },
  { name: "OAI-SearchBot", re: /OAI-SearchBot/i },
  { name: "ChatGPT-User", re: /ChatGPT-User/i },
  { name: "ClaudeBot", re: /ClaudeBot|Claude-Web|anthropic-ai/i },
  { name: "PerplexityBot", re: /PerplexityBot|Perplexity-User/i },
  { name: "Google-Extended", re: /Google-Extended/i },
  { name: "Applebot", re: /Applebot-Extended|Applebot/i },
  { name: "Bytespider", re: /Bytespider/i },
  { name: "CCBot", re: /CCBot/i },
  { name: "Amazonbot", re: /Amazonbot/i },
  { name: "Meta-AI", re: /Meta-ExternalAgent|FacebookBot/i },
  { name: "cohere-ai", re: /cohere-ai/i },
];

/** Returns the AI crawler name if the UA matches one, else null. */
export function detectAICrawler(ua: string | null): string | null {
  if (!ua) return null;
  for (const c of AI_CRAWLERS) if (c.re.test(ua)) return c.name;
  return null;
}

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

/** Log a crawler visit to the events table via Supabase REST (edge-safe). */
export async function logCrawlerVisit(
  bot: string,
  path: string,
  ua: string | null,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        type: "crawler_visit",
        path,
        meta: { bot },
        user_agent: ua,
      }),
      signal: AbortSignal.timeout(2500),
    });
  } catch {
    /* never block the crawler's request on a logging failure */
  }
}
