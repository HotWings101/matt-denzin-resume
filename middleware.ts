import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { detectAICrawler, logCrawlerVisit } from "@/lib/crawlers";

export async function middleware(request: NextRequest) {
  const ua = request.headers.get("user-agent");
  const bot = detectAICrawler(ua);
  if (bot) {
    // Log AI/LLM crawler visits so they show up in the analytics dashboard.
    await logCrawlerVisit(bot, request.nextUrl.pathname, ua);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and images so the admin guard
     * and session refresh apply to /admin routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
