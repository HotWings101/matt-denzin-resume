import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface EventInput {
  type: string;
  path?: string | null;
  visitorId?: string | null;
  meta?: Record<string, unknown>;
  userAgent?: string | null;
  referrer?: string | null;
}

/**
 * Insert an analytics event. Server-only. Never throws — tracking failures
 * must not break the user experience.
 */
export async function recordEvent(e: EventInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getAdminClient();
    await supabase.from("events").insert({
      type: e.type,
      path: e.path ?? null,
      visitor_id: e.visitorId ?? null,
      meta: e.meta ?? {},
      user_agent: e.userAgent ?? null,
      referrer: e.referrer ?? null,
    });
  } catch (err) {
    console.error("[tracking] recordEvent failed:", err);
  }
}
