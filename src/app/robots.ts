import type { MetadataRoute } from "next";

const base =
  process.env.NEXT_PUBLIC_SITE_URL || "https://matthewdenzin.ai";

/** Welcomes general + AI/LLM crawlers; keeps /admin and /api private. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      {
        // Explicitly invite AI/LLM crawlers so this profile is indexable by them.
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "CCBot",
          "cohere-ai",
          "Meta-ExternalAgent",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
