import { getVisitorId } from "./utils";

/**
 * Fire-and-forget client event. Uses sendBeacon when available so it survives
 * page unloads (e.g. outbound CTA clicks), falling back to keepalive fetch.
 */
export function track(type: string, meta?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      type,
      path: window.location.pathname,
      visitorId: getVisitorId(),
      meta: meta ?? {},
    });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) return;
    void fetch("/api/track", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    });
  } catch {
    /* never throw from tracking */
  }
}
