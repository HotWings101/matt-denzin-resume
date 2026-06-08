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
