import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

/**
 * Shared, exact type contract between the data layer (here) and the admin UI.
 * The UI imports these from "@/lib/visitors".
 */
export interface VisitorEvent {
  type: string; // page_view | click | scroll_depth | section_view | page_exit | ...
  createdAt: string; // ISO
  meta: Record<string, unknown>;
}

export interface VisitorSession {
  sessionId: string;
  visitorId: string | null;
  startedAt: string; // ISO (first_seen)
  durationSec: number;
  activeSec: number;
  pageViews: number;
  maxScroll: number; // percent
  bounced: boolean;
  eventsCount: number;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  entryPath: string | null;
  exitPath: string | null;
  journey: VisitorEvent[]; // this session's events, oldest-first
  conversation: { role: string; content: string }[]; // this visitor's chat (may be [])
  jd: { roleTitle: string | null; company: string | null; fitScore: number | null }[];
  contact: { name: string; email: string; message: string } | null;
}

/** Caps to keep payloads bounded. */
const MAX_SESSIONS = 40;
const MAX_EVENTS = 1500;
const MAX_CHAT_SESSIONS = 200;
const MAX_CHAT_MESSAGES = 2000;
const MAX_JD = 200;
const MAX_CONTACTS = 200;
const MAX_JOURNEY_PER_SESSION = 200;
const MAX_CONVERSATION_PER_VISITOR = 100;
const MAX_JD_PER_VISITOR = 20;

// Explicit shapes for the Supabase rows we read (no `any`).
interface SessionRow {
  id: string;
  visitor_id: string | null;
  first_seen: string | null;
  duration_ms: number | null;
  active_ms: number | null;
  page_views: number | null;
  events_count: number | null;
  max_scroll: number | null;
  bounced: boolean | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  entry_path: string | null;
  exit_path: string | null;
}

interface EventRow {
  session_id: string | null;
  type: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

interface ChatSessionRow {
  id: string;
  visitor_id: string | null;
}

interface ChatMessageRow {
  session_id: string;
  role: string | null;
  content: string | null;
  created_at: string;
}

interface JdRow {
  visitor_id: string | null;
  role_title: string | null;
  company: string | null;
  fit_score: number | null;
  created_at: string;
}

interface ContactRow {
  visitor_id: string | null;
  name: string | null;
  email: string | null;
  message: string | null;
  created_at: string;
}

const msToSec = (ms: number | null): number => Math.round((ms ?? 0) / 1000);

export async function getRecentVisitorSessions(days = 30): Promise<VisitorSession[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getAdminClient();
    const since = new Date(Date.now() - days * 86400000).toISOString();

    // 1) Most recent sessions in the window.
    const sessionsRes = await supabase
      .from("sessions")
      .select(
        "id,visitor_id,first_seen,duration_ms,active_ms,page_views,events_count,max_scroll,bounced,device,browser,os,country,region,city,referrer,entry_path,exit_path",
      )
      .gte("created_at", since)
      .order("last_seen", { ascending: false })
      .limit(MAX_SESSIONS);

    const sessionRows = (sessionsRes.data ?? []) as SessionRow[];
    if (sessionRows.length === 0) return [];

    const sessionIds = sessionRows.map((s) => s.id);
    const visitorIds = [
      ...new Set(
        sessionRows
          .map((s) => s.visitor_id)
          .filter((v): v is string => Boolean(v)),
      ),
    ];

    // 2) Events for those sessions, oldest-first, grouped into journeys.
    const eventsRes = await supabase
      .from("events")
      .select("session_id,type,meta,created_at")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true })
      .limit(MAX_EVENTS);

    const journeyBySession = new Map<string, VisitorEvent[]>();
    for (const e of (eventsRes.data ?? []) as EventRow[]) {
      if (!e.session_id) continue;
      const arr = journeyBySession.get(e.session_id) ?? [];
      if (arr.length >= MAX_JOURNEY_PER_SESSION) continue;
      arr.push({
        type: e.type ?? "unknown",
        createdAt: e.created_at,
        meta: (e.meta ?? {}) as Record<string, unknown>,
      });
      journeyBySession.set(e.session_id, arr);
    }

    // 3) Visitor-scoped data: conversation, jd, contact.
    const conversationByVisitor = new Map<string, { role: string; content: string }[]>();
    const jdByVisitor = new Map<
      string,
      { roleTitle: string | null; company: string | null; fitScore: number | null }[]
    >();
    const contactByVisitor = new Map<string, { name: string; email: string; message: string }>();

    if (visitorIds.length > 0) {
      const [chatSessRes, jdRes, contactRes] = await Promise.all([
        supabase
          .from("chat_sessions")
          .select("id,visitor_id")
          .in("visitor_id", visitorIds)
          .limit(MAX_CHAT_SESSIONS),
        supabase
          .from("jd_analyses")
          .select("visitor_id,role_title,company,fit_score,created_at")
          .in("visitor_id", visitorIds)
          .order("created_at", { ascending: false })
          .limit(MAX_JD),
        supabase
          .from("contact_messages")
          .select("visitor_id,name,email,message,created_at")
          .in("visitor_id", visitorIds)
          .order("created_at", { ascending: false })
          .limit(MAX_CONTACTS),
      ]);

      // 3a) Chat: chat_sessions -> chat_messages, grouped by visitor.
      const chatSessions = (chatSessRes.data ?? []) as ChatSessionRow[];
      if (chatSessions.length > 0) {
        const chatSessionIds = chatSessions.map((c) => c.id);
        const visitorByChatSession = new Map<string, string>();
        for (const c of chatSessions) {
          if (c.visitor_id) visitorByChatSession.set(c.id, c.visitor_id);
        }

        const msgsRes = await supabase
          .from("chat_messages")
          .select("session_id,role,content,created_at")
          .in("session_id", chatSessionIds)
          .order("created_at", { ascending: true })
          .limit(MAX_CHAT_MESSAGES);

        for (const m of (msgsRes.data ?? []) as ChatMessageRow[]) {
          const visitorId = visitorByChatSession.get(m.session_id);
          if (!visitorId) continue;
          const arr = conversationByVisitor.get(visitorId) ?? [];
          if (arr.length >= MAX_CONVERSATION_PER_VISITOR) continue;
          arr.push({ role: m.role ?? "unknown", content: m.content ?? "" });
          conversationByVisitor.set(visitorId, arr);
        }
      }

      // 3b) JD analyses grouped by visitor.
      for (const j of (jdRes.data ?? []) as JdRow[]) {
        if (!j.visitor_id) continue;
        const arr = jdByVisitor.get(j.visitor_id) ?? [];
        if (arr.length >= MAX_JD_PER_VISITOR) continue;
        arr.push({
          roleTitle: j.role_title,
          company: j.company,
          fitScore: j.fit_score,
        });
        jdByVisitor.set(j.visitor_id, arr);
      }

      // 3c) Contact: newest per visitor (rows already ordered desc).
      for (const c of (contactRes.data ?? []) as ContactRow[]) {
        if (!c.visitor_id || contactByVisitor.has(c.visitor_id)) continue;
        contactByVisitor.set(c.visitor_id, {
          name: c.name ?? "",
          email: c.email ?? "",
          message: c.message ?? "",
        });
      }
    }

    // 4) Assemble.
    return sessionRows.map((s) => {
      const vId = s.visitor_id;
      return {
        sessionId: s.id,
        visitorId: vId,
        startedAt: s.first_seen ?? "",
        durationSec: msToSec(s.duration_ms),
        activeSec: msToSec(s.active_ms),
        pageViews: s.page_views ?? 0,
        maxScroll: s.max_scroll ?? 0,
        bounced: Boolean(s.bounced),
        eventsCount: s.events_count ?? 0,
        device: s.device,
        browser: s.browser,
        os: s.os,
        country: s.country,
        region: s.region,
        city: s.city,
        referrer: s.referrer,
        entryPath: s.entry_path,
        exitPath: s.exit_path,
        journey: journeyBySession.get(s.id) ?? [],
        conversation: (vId && conversationByVisitor.get(vId)) || [],
        jd: (vId && jdByVisitor.get(vId)) || [],
        contact: (vId && contactByVisitor.get(vId)) || null,
      };
    });
  } catch (err) {
    console.error("[visitors] failed:", err);
    return [];
  }
}
