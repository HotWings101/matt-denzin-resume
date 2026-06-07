import { recordEvent } from "@/lib/tracking";

/** Only these event types are accepted, to keep the analytics stream clean. */
const ALLOWED_TYPES = new Set([
  "page_view",
  "section_view",
  "cta_click",
  "resume_download",
  "chat_open",
  "chat_started",
  "chat_question",
  "jd_submit",
  "jd_analyze_click",
  "contact_submit",
]);

const MAX_META_BYTES = 2048;

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

    await recordEvent({
      type,
      path: body?.path ? String(body.path).slice(0, 512) : null,
      visitorId: body?.visitorId ? String(body.visitorId).slice(0, 64) : null,
      meta,
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
    });
  } catch (err) {
    console.error("[track] failed:", err);
  }
  // Always 204 — tracking must never surface an error to the client.
  return new Response(null, { status: 204 });
}
