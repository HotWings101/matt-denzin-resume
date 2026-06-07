import { ingestEvent } from "@/lib/analytics-ingest";

/** Accepted event types — keeps the analytics stream clean. */
const ALLOWED_TYPES = new Set([
  "page_view",
  "section_view",
  "click",
  "scroll_depth",
  "page_exit",
  "cta_click",
  "chat_open",
  "chat_started",
  "chat_question",
  "jd_submit",
  "jd_analyze_click",
  "contact_submit",
  "resume_download",
]);

const MAX_META_BYTES = 4096;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = String(body?.type ?? "").slice(0, 64);
    if (!ALLOWED_TYPES.has(type)) return new Response(null, { status: 204 });

    let meta: Record<string, unknown> = {};
    if (typeof body?.meta === "object" && body.meta) {
      const candidate = body.meta as Record<string, unknown>;
      if (JSON.stringify(candidate).length <= MAX_META_BYTES) meta = candidate;
    }

    await ingestEvent({
      type,
      path: body?.path ? String(body.path).slice(0, 512) : null,
      visitorId: body?.visitorId ? String(body.visitorId).slice(0, 64) : null,
      sessionId: body?.sessionId ? String(body.sessionId).slice(0, 64) : null,
      meta,
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
      // Vercel edge geo headers (absent locally).
      country: req.headers.get("x-vercel-ip-country"),
      region: req.headers.get("x-vercel-ip-country-region"),
      city: req.headers.get("x-vercel-ip-city"),
    });
  } catch (err) {
    console.error("[track] failed:", err);
  }
  // Always 204 — tracking must never surface an error to the client.
  return new Response(null, { status: 204 });
}
