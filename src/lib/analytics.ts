import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface Counted {
  key: string;
  count: number;
}
export interface HeatPoint {
  xPct: number;
  yPct: number;
  label?: string | null;
  section?: string | null;
}
export interface ConversationMsg {
  role: string;
  content: string;
  citations?: unknown;
  created_at: string;
}
export interface Conversation {
  sessionId: string;
  createdAt: string;
  visitorId: string | null;
  messages: ConversationMsg[];
}
export interface JdRow {
  role_title: string | null;
  company: string | null;
  fit_score: number | null;
  created_at: string;
  jd_text: string;
}
export interface ContactRow {
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface AnalyticsData {
  days: number;
  totals: {
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
    bounceRate: number;
    avgDurationSec: number;
    avgActiveSec: number;
    chatQuestions: number;
    jdAnalyses: number;
    contacts: number;
  };
  daily: { day: string; views: number; visitors: number }[];
  topReferrers: Counted[];
  devices: Counted[];
  browsers: Counted[];
  countries: Counted[];
  sectionViews: Counted[];
  scrollDistribution: { depth: number; count: number }[];
  topQuestions: Counted[];
  heatmap: { points: HeatPoint[]; topClicks: Counted[] };
  conversations: Conversation[];
  recentJd: JdRow[];
  recentContacts: ContactRow[];
}

const EMPTY: AnalyticsData = {
  days: 30,
  totals: {
    pageViews: 0,
    uniqueVisitors: 0,
    sessions: 0,
    bounceRate: 0,
    avgDurationSec: 0,
    avgActiveSec: 0,
    chatQuestions: 0,
    jdAnalyses: 0,
    contacts: 0,
  },
  daily: [],
  topReferrers: [],
  devices: [],
  browsers: [],
  countries: [],
  sectionViews: [],
  scrollDistribution: [25, 50, 75, 100].map((depth) => ({ depth, count: 0 })),
  topQuestions: [],
  heatmap: { points: [], topClicks: [] },
  conversations: [],
  recentJd: [],
  recentContacts: [],
};

type Meta = Record<string, unknown>;

function tally(items: (string | null | undefined)[], topN?: number): Counted[] {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = it && it.trim() ? it.trim() : "unknown";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  const arr = [...m.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
  return topN ? arr.slice(0, topN) : arr;
}

function refHost(r: string | null | undefined): string {
  if (!r) return "Direct";
  try {
    return new URL(r).hostname.replace(/^www\./, "");
  } catch {
    return r.slice(0, 60);
  }
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getAnalytics(days = 30): Promise<AnalyticsData> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const supabase = getAdminClient();
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const [
      pvCount,
      jdCount,
      contactCount,
      chatQCount,
      sessionsRes,
      pvRows,
      sectionRows,
      scrollRows,
      clickRows,
      questionRows,
      jdRows,
      contactRows,
      chatSessRes,
    ] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "page_view").gte("created_at", since),
      supabase.from("jd_analyses").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }).eq("role", "user").gte("created_at", since),
      supabase.from("sessions").select("visitor_id,duration_ms,active_ms,bounced,device,browser,country,referrer").gte("created_at", since).limit(8000),
      supabase.from("events").select("visitor_id,created_at").eq("type", "page_view").gte("created_at", since).limit(20000),
      supabase.from("events").select("meta").eq("type", "section_view").gte("created_at", since).limit(10000),
      supabase.from("events").select("meta").eq("type", "scroll_depth").gte("created_at", since).limit(10000),
      supabase.from("events").select("meta").eq("type", "click").gte("created_at", since).order("created_at", { ascending: false }).limit(4000),
      supabase.from("chat_messages").select("content").eq("role", "user").gte("created_at", since).order("created_at", { ascending: false }).limit(1000),
      supabase.from("jd_analyses").select("role_title,company,fit_score,created_at,jd_text").gte("created_at", since).order("created_at", { ascending: false }).limit(50),
      supabase.from("contact_messages").select("name,email,message,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(50),
      supabase.from("chat_sessions").select("id,created_at,visitor_id").gte("created_at", since).order("created_at", { ascending: false }).limit(40),
    ]);

    const sessions = (sessionsRes.data ?? []) as Array<{
      visitor_id: string | null;
      duration_ms: number | null;
      active_ms: number | null;
      bounced: boolean | null;
      device: string | null;
      browser: string | null;
      country: string | null;
      referrer: string | null;
    }>;
    const sessionCount = sessions.length;
    const bounced = sessions.filter((s) => s.bounced).length;
    const bounceRate = sessionCount ? Math.round((bounced / sessionCount) * 100) : 0;
    const avgDurationSec = sessionCount
      ? Math.round(sessions.reduce((a, s) => a + (s.duration_ms ?? 0), 0) / sessionCount / 1000)
      : 0;
    const avgActiveSec = sessionCount
      ? Math.round(sessions.reduce((a, s) => a + (s.active_ms ?? 0), 0) / sessionCount / 1000)
      : 0;

    const pv = (pvRows.data ?? []) as Array<{ visitor_id: string | null; created_at: string }>;
    const uniqueVisitors = new Set(pv.map((r) => r.visitor_id).filter(Boolean)).size;

    const dayMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (const r of pv) {
      const day = r.created_at.slice(0, 10);
      const e = dayMap.get(day) ?? { views: 0, visitors: new Set<string>() };
      e.views++;
      if (r.visitor_id) e.visitors.add(r.visitor_id);
      dayMap.set(day, e);
    }
    const daily = lastNDays(Math.min(days, 30)).map((day) => ({
      day,
      views: dayMap.get(day)?.views ?? 0,
      visitors: dayMap.get(day)?.visitors.size ?? 0,
    }));

    const topReferrers = tally(sessions.map((s) => refHost(s.referrer)), 10);
    const devices = tally(sessions.map((s) => s.device), 6);
    const browsers = tally(sessions.map((s) => s.browser), 8);
    const countries = tally(sessions.map((s) => s.country), 12);

    const sectionViews = tally(
      (sectionRows.data ?? []).map((r) => (r.meta as Meta)?.section as string | undefined),
    );
    const scrollTally = tally(
      (scrollRows.data ?? []).map((r) => String((r.meta as Meta)?.depth ?? "")),
    );
    const scrollDistribution = [25, 50, 75, 100].map((depth) => ({
      depth,
      count: scrollTally.find((x) => x.key === String(depth))?.count ?? 0,
    }));

    const clickMetas = (clickRows.data ?? [])
      .map((r) => r.meta as Meta)
      .filter((m) => typeof m?.xPct === "number" && typeof m?.yPct === "number");
    const heatmapPoints: HeatPoint[] = clickMetas.map((m) => ({
      xPct: m.xPct as number,
      yPct: m.yPct as number,
      label: (m.label as string) ?? null,
      section: (m.section as string) ?? null,
    }));
    const topClicks = tally(clickMetas.map((m) => m.label as string | undefined), 12);

    const topQuestions = tally(
      (questionRows.data ?? []).map((r) => (r.content as string).trim().replace(/\s+/g, " ")),
      12,
    );

    const chatSessions = (chatSessRes.data ?? []) as Array<{
      id: string;
      created_at: string;
      visitor_id: string | null;
    }>;
    let conversations: Conversation[] = [];
    if (chatSessions.length > 0) {
      const ids = chatSessions.map((s) => s.id);
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("session_id,role,content,citations,created_at")
        .in("session_id", ids)
        .order("created_at", { ascending: true })
        .limit(2000);
      const byS = new Map<string, ConversationMsg[]>();
      for (const m of (msgs ?? []) as Array<ConversationMsg & { session_id: string }>) {
        const arr = byS.get(m.session_id) ?? [];
        arr.push({ role: m.role, content: m.content, citations: m.citations, created_at: m.created_at });
        byS.set(m.session_id, arr);
      }
      conversations = chatSessions
        .map((s) => ({
          sessionId: s.id,
          createdAt: s.created_at,
          visitorId: s.visitor_id,
          messages: byS.get(s.id) ?? [],
        }))
        .filter((c) => c.messages.length > 0);
    }

    return {
      days,
      totals: {
        pageViews: pvCount.count ?? 0,
        uniqueVisitors,
        sessions: sessionCount,
        bounceRate,
        avgDurationSec,
        avgActiveSec,
        chatQuestions: chatQCount.count ?? 0,
        jdAnalyses: jdCount.count ?? 0,
        contacts: contactCount.count ?? 0,
      },
      daily,
      topReferrers,
      devices,
      browsers,
      countries,
      sectionViews,
      scrollDistribution,
      heatmap: { points: heatmapPoints, topClicks },
      topQuestions,
      conversations,
      recentJd: (jdRows.data ?? []) as JdRow[],
      recentContacts: (contactRows.data ?? []) as ContactRow[],
    };
  } catch (err) {
    console.error("[analytics] failed:", err);
    return EMPTY;
  }
}
