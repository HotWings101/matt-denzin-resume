import { getVisitorId } from "./utils";

const SESSION_KEY = "md_session_id";

/** Per-visit session id (resets each tab session). */
function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      "s_" +
      Math.random().toString(36).slice(2, 12) +
      Date.now().toString(36).slice(-4);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Fire-and-forget event. Uses sendBeacon so it survives page unloads. */
export function track(type: string, meta: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      type,
      path: window.location.pathname,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      meta,
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

function parseUtm(): Record<string, string> {
  const p = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = p.get(k);
    if (v) out[k] = v.slice(0, 120);
  }
  return out;
}

function deviceHint(): string {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

/**
 * Initialize full-page analytics: page view, scroll depth, click heatmap,
 * section views, active-time + dwell, and exit. Returns a cleanup function.
 */
export function initAnalytics(): () => void {
  track("page_view", {
    referrer: document.referrer || null,
    ...parseUtm(),
    vw: window.innerWidth,
    vh: window.innerHeight,
    screen: `${window.screen.width}x${window.screen.height}`,
    device: deviceHint(),
    lang: navigator.language,
  });

  // --- scroll depth ---
  let maxScroll = 0;
  const marks = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const pct =
      scrollable > 0
        ? Math.min(100, Math.round((window.scrollY / scrollable) * 100))
        : 100;
    if (pct > maxScroll) maxScroll = pct;
    for (const m of [25, 50, 75, 100]) {
      if (pct >= m && !marks.has(m)) {
        marks.add(m);
        track("scroll_depth", { depth: m });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- click heatmap (throttled, coords as % of document) ---
  let lastClick = 0;
  const onClick = (e: MouseEvent) => {
    const now = Date.now();
    if (now - lastClick < 100) return;
    lastClick = now;
    const docW = document.documentElement.scrollWidth || window.innerWidth;
    const docH = document.documentElement.scrollHeight || window.innerHeight;
    const el = e.target as HTMLElement | null;
    const label =
      el?.closest("[data-track]")?.getAttribute("data-track") ||
      el?.closest("a,button")?.textContent?.trim().slice(0, 60) ||
      el?.tagName?.toLowerCase() ||
      "unknown";
    const section =
      el?.closest("[data-section]")?.getAttribute("data-section") || null;
    track("click", {
      xPct: Math.round((e.pageX / docW) * 1000) / 10,
      yPct: Math.round((e.pageY / docH) * 1000) / 10,
      label,
      section,
      vw: window.innerWidth,
    });
  };
  window.addEventListener("click", onClick, { passive: true, capture: true });

  // --- section views (once each) ---
  const seen = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const id = en.target.getAttribute("data-section");
        if (en.isIntersecting && id && !seen.has(id)) {
          seen.add(id);
          track("section_view", { section: id });
        }
      }
    },
    { threshold: 0.4 },
  );
  document.querySelectorAll("[data-section]").forEach((el) => io.observe(el));

  // --- active time + dwell ---
  const start = Date.now();
  let activeMs = 0;
  let lastTick = Date.now();
  let visible = !document.hidden;
  const tick = () => {
    const now = Date.now();
    if (visible) activeMs += now - lastTick;
    lastTick = now;
  };
  const heartbeat = window.setInterval(tick, 5000);

  let exitSent = false;
  const sendExit = (reason: string) => {
    if (exitSent) return;
    exitSent = true;
    tick();
    track("page_exit", {
      durationMs: Date.now() - start,
      activeMs,
      maxScroll,
      reason,
    });
  };

  const onVis = () => {
    tick();
    visible = !document.hidden;
    lastTick = Date.now();
    if (document.hidden) sendExit("hidden");
  };
  document.addEventListener("visibilitychange", onVis);
  const onPageHide = () => sendExit("pagehide");
  window.addEventListener("pagehide", onPageHide);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", onPageHide);
    window.clearInterval(heartbeat);
    io.disconnect();
  };
}
