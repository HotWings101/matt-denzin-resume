import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { AdminDashboardProps } from "@/components/admin/admin-dashboard";

export type DashboardData = Omit<AdminDashboardProps, "headerAction">;

const EMPTY: DashboardData = {
  totals: {
    pageViews: 0,
    uniqueVisitors: 0,
    chatQuestions: 0,
    jdAnalyses: 0,
    contacts: 0,
  },
  topQuestions: [],
  sectionViews: [],
  daily: [],
  recentJd: [],
  recentContacts: [],
};

/** Build the admin analytics from Supabase. Degrades to zeros on any failure. */
export async function getDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured()) return EMPTY;

  try {
    const supabase = getAdminClient();

    const [
      pageViewsRes,
      jdCountRes,
      contactCountRes,
      chatQRes,
      visitorRows,
      sectionRows,
      dailyRows,
      topQRows,
      recentJdRes,
      recentContactRes,
    ] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "page_view"),
      supabase.from("jd_analyses").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "chat_question"),
      supabase.from("events").select("visitor_id").eq("type", "page_view").not("visitor_id", "is", null).limit(10000),
      supabase.from("events").select("meta").eq("type", "section_view").limit(10000),
      supabase.from("events").select("created_at").eq("type", "page_view").gte("created_at", sinceDaysAgo(14)).limit(20000),
      supabase.from("chat_messages").select("content").eq("role", "user").order("created_at", { ascending: false }).limit(500),
      supabase.from("jd_analyses").select("role_title, company, fit_score, created_at").order("created_at", { ascending: false }).limit(8),
      supabase.from("contact_messages").select("name, email, message, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

    const uniqueVisitors = new Set(
      (visitorRows.data ?? []).map((r) => (r as { visitor_id: string }).visitor_id),
    ).size;

    const sectionViews = aggregate(
      (sectionRows.data ?? []).map(
        (r) => (r as { meta: { section?: string } }).meta?.section ?? "unknown",
      ),
    ).map(([section, count]) => ({ section, count }));

    const topQuestions = aggregate(
      (topQRows.data ?? []).map((r) =>
        (r as { content: string }).content.trim().replace(/\s+/g, " "),
      ),
    )
      .slice(0, 8)
      .map(([question, count]) => ({ question, count }));

    const daily = lastNDays(14).map((day) => ({
      day,
      views: (dailyRows.data ?? []).filter((r) =>
        (r as { created_at: string }).created_at.startsWith(day),
      ).length,
    }));

    return {
      totals: {
        pageViews: pageViewsRes.count ?? 0,
        uniqueVisitors,
        chatQuestions: chatQRes.count ?? 0,
        jdAnalyses: jdCountRes.count ?? 0,
        contacts: contactCountRes.count ?? 0,
      },
      topQuestions,
      sectionViews,
      daily,
      recentJd: (recentJdRes.data ?? []) as DashboardData["recentJd"],
      recentContacts: (recentContactRes.data ?? []) as DashboardData["recentContacts"],
    };
  } catch (err) {
    console.error("[analytics] failed:", err);
    return EMPTY;
  }
}

function aggregate(items: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function sinceDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
