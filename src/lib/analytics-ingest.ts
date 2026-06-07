import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { parseUserAgent } from "@/lib/ua";

/** Event types that prove engagement (flip a session from bounced → not). */
const ENGAGEMENT = new Set([
  "click",
  "chat_started",
  "chat_question",
  "jd_submit",
  "jd_analyze_click",
  "contact_submit",
  "resume_download",
]);

export interface IngestInput {
  type: string;
  path?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  meta?: Record<string, unknown>;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
}

/** Insert an event and upsert its session via the atomic ingest_event RPC. */
export async function ingestEvent(i: IngestInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getAdminClient();
    const meta = i.meta ?? {};
    const { device, browser, os } = parseUserAgent(i.userAgent);
    // scroll_depth reports `depth`; page_exit reports `maxScroll`.
    const depth =
      typeof meta.depth === "number"
        ? (meta.depth as number)
        : typeof meta.maxScroll === "number"
          ? (meta.maxScroll as number)
          : 0;
    const engaged =
      ENGAGEMENT.has(i.type) || (i.type === "scroll_depth" && depth >= 50);
    const durationMs =
      typeof meta.durationMs === "number" ? (meta.durationMs as number) : 0;
    const activeMs =
      typeof meta.activeMs === "number" ? (meta.activeMs as number) : 0;

    const { error } = await supabase.rpc("ingest_event", {
      p_type: i.type,
      p_path: i.path ?? null,
      p_visitor_id: i.visitorId ?? null,
      p_session_id: i.sessionId ?? null,
      p_meta: meta,
      p_user_agent: i.userAgent,
      p_referrer: (meta.referrer as string) ?? i.referrer ?? null,
      p_country: i.country,
      p_region: i.region,
      p_city: i.city ? decodeURIComponent(i.city) : null,
      p_device: (meta.device as string) || device,
      p_browser: browser,
      p_os: os,
      p_engaged: engaged,
      p_is_page_view: i.type === "page_view",
      p_depth: Math.round(depth),
      p_duration_ms: Math.round(durationMs),
      p_active_ms: Math.round(activeMs),
    });
    if (error) console.error("[ingest] rpc error:", error.message);
  } catch (e) {
    console.error("[ingest] failed:", e);
  }
}
