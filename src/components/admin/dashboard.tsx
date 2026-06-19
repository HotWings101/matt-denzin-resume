"use client";

import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Users,
  Fingerprint,
  MousePointerClick,
  MessagesSquare,
  Target,
  Mail,
  Bot,
} from "lucide-react";
import type { AnalyticsData } from "@/lib/analytics";
import type { VisitorSession } from "@/lib/visitors";
import { cn } from "@/lib/utils";
import {
  StatCard,
  BarList,
  MiniBars,
  Panel,
  formatDuration,
  relativeTime,
} from "./ui";
import { ClickHeatmap } from "./heatmap";
import { VisitorsTab } from "./visitors";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "audience", label: "Audience", icon: Users },
  { id: "visitors", label: "Visitors", icon: Fingerprint },
  { id: "engagement", label: "Engagement", icon: MousePointerClick },
  { id: "conversations", label: "Conversations", icon: MessagesSquare },
  { id: "jd", label: "JD Analyses", icon: Target },
  { id: "messages", label: "Messages", icon: Mail },
] as const;
type TabId = (typeof TABS)[number]["id"];

const RANGES = [7, 30, 90];

export function AnalyticsDashboard({
  data,
  visitors,
  signOut,
}: {
  data: AnalyticsData;
  visitors: VisitorSession[];
  signOut: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            Career site analytics
          </h1>
          <p className="mt-1 text-sm text-muted">
            Last {data.days} days · live from Supabase
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-full border border-border bg-surface text-sm">
            {RANGES.map((r) => (
              <a
                key={r}
                href={`?range=${r}`}
                className={cn(
                  "px-3.5 py-1.5 transition-colors",
                  data.days === r
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-foreground",
                )}
              >
                {r}d
              </a>
            ))}
          </div>
          {signOut}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-7 flex flex-wrap gap-1.5 border-b border-border pb-px">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <Overview data={data} onVisitors={() => setTab("visitors")} />
      )}
      {tab === "audience" && <Audience data={data} />}
      {tab === "visitors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Humans" value={data.summary.humans} />
            <StatCard label="Bots filtered" value={data.summary.bots} />
            <StatCard
              label="New / Returning"
              value={`${data.summary.newVisitors} / ${data.summary.returningVisitors}`}
              sub="this period"
            />
            <StatCard
              label="Returning rate"
              value={`${data.summary.returningRate}%`}
              accent
            />
          </div>
          <VisitorsTab sessions={visitors} />
        </div>
      )}
      {tab === "engagement" && <Engagement data={data} />}
      {tab === "conversations" && <Conversations data={data} />}
      {tab === "jd" && <JdAnalyses data={data} />}
      {tab === "messages" && <Messages data={data} />}
    </div>
  );
}

function Overview({
  data,
  onVisitors,
}: {
  data: AnalyticsData;
  onVisitors: () => void;
}) {
  const t = data.totals;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button
          type="button"
          onClick={onVisitors}
          className="rounded-xl text-left transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <StatCard label="Unique visitors  ↗" value={t.uniqueVisitors} />
        </button>
        <StatCard label="Sessions" value={t.sessions} />
        <StatCard label="Page views" value={t.pageViews} />
        <StatCard
          label="Bounce rate"
          value={`${t.bounceRate}%`}
          accent={t.bounceRate > 60}
        />
        <StatCard
          label="Avg. visit"
          value={formatDuration(t.avgDurationSec)}
          sub={`${formatDuration(t.avgActiveSec)} active`}
        />
        <StatCard label="Chat questions" value={t.chatQuestions} accent />
        <StatCard label="JD analyses" value={t.jdAnalyses} accent />
        <StatCard label="Messages" value={t.contacts} accent />
      </div>

      <Panel title="Daily page views">
        <MiniBars data={data.daily} />
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Section reach">
          <BarList items={data.sectionViews} />
        </Panel>
        <Panel title="Scroll depth">
          <BarList
            items={data.scrollDistribution.map((s) => ({
              key: `${s.depth}%`,
              count: s.count,
            }))}
            accentClass="bg-clay"
          />
        </Panel>
      </div>
    </div>
  );
}

function Audience({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Panel title="Top countries">
        <BarList items={data.countries} emptyLabel="No geo data yet (local dev has none)." />
      </Panel>
      <Panel title="Referrers">
        <BarList items={data.topReferrers} />
      </Panel>
      <Panel title="Traffic sources">
        <BarList items={data.trafficSources} emptyLabel="No traffic-source data yet." />
      </Panel>
      <Panel title="Devices">
        <BarList items={data.devices} accentClass="bg-foreground" />
      </Panel>
      <Panel title="Browsers">
        <BarList items={data.browsers} accentClass="bg-foreground" />
      </Panel>
      <CrawlerPanel crawlers={data.crawlers} />
    </div>
  );
}

type CrawlerRowData = { bot: string; count: number; lastSeen: string };

/** Who runs each AI crawler and what it does. `human` = a person fetching your
 *  page through an AI product; `indexing` = an automated training/search crawl. */
const CRAWLER_META: Record<
  string,
  { who: string; job: string; kind: "human" | "indexing" }
> = {
  "ChatGPT-User": {
    who: "OpenAI",
    job: "On-demand fetch when a person opens your page inside ChatGPT",
    kind: "human",
  },
  GPTBot: { who: "OpenAI", job: "Trains GPT models", kind: "indexing" },
  "OAI-SearchBot": {
    who: "OpenAI",
    job: "Indexes your site for ChatGPT Search",
    kind: "indexing",
  },
  ClaudeBot: {
    who: "Anthropic",
    job: "Trains & improves Claude",
    kind: "indexing",
  },
  PerplexityBot: {
    who: "Perplexity",
    job: "Indexes for the Perplexity answer engine",
    kind: "indexing",
  },
  "Google-Extended": {
    who: "Google",
    job: "Trains Gemini / Google AI models",
    kind: "indexing",
  },
  Applebot: {
    who: "Apple",
    job: "Powers Siri, Spotlight & Apple Intelligence",
    kind: "indexing",
  },
  Bytespider: {
    who: "ByteDance",
    job: "Trains TikTok / Doubao AI models",
    kind: "indexing",
  },
  CCBot: {
    who: "Common Crawl",
    job: "Open dataset many LLMs train on",
    kind: "indexing",
  },
  Amazonbot: {
    who: "Amazon",
    job: "Indexes for Alexa & Amazon AI",
    kind: "indexing",
  },
  "Meta-AI": { who: "Meta", job: "Trains Llama / Meta AI", kind: "indexing" },
  "cohere-ai": { who: "Cohere", job: "Trains Cohere models", kind: "indexing" },
};

const UNKNOWN_CRAWLER = {
  who: "Unknown",
  job: "AI crawler",
  kind: "indexing" as const,
};

function CrawlerRow({ c }: { c: CrawlerRowData }) {
  const meta = CRAWLER_META[c.bot] ?? UNKNOWN_CRAWLER;
  return (
    <li className="flex items-start justify-between gap-3 py-2.5">
      <span className="flex min-w-0 items-start gap-2">
        <Bot className="mt-0.5 size-4 shrink-0 text-accent" />
        <span className="min-w-0">
          <span className="text-sm text-foreground">
            {c.bot}
            <span className="text-muted"> · {meta.who}</span>
          </span>
          <span className="mt-0.5 block text-xs text-faint">{meta.job}</span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-5">
        <span className="font-mono text-xs text-muted">
          {c.count} {c.count === 1 ? "visit" : "visits"}
        </span>
        <span className="font-mono text-[0.7rem] text-faint">
          last {relativeTime(c.lastSeen)}
        </span>
      </span>
    </li>
  );
}

function CrawlerPanel({ crawlers }: { crawlers: CrawlerRowData[] }) {
  const kindOf = (bot: string) => (CRAWLER_META[bot] ?? UNKNOWN_CRAWLER).kind;
  const human = crawlers.filter((c) => kindOf(c.bot) === "human");
  const indexing = crawlers.filter((c) => kindOf(c.bot) === "indexing");

  return (
    <Panel title="AI / LLM crawler visits" className="md:col-span-2">
      {crawlers.length === 0 ? (
        <p className="text-sm text-muted">
          No AI crawlers detected yet — GPTBot, ClaudeBot, PerplexityBot,
          Google-Extended and others will appear here once they index the site.
        </p>
      ) : (
        <div className="space-y-5">
          {human.length > 0 && (
            <div>
              <p className="eyebrow mb-2 text-[0.6rem]">
                Human via AI · a person used an AI tool to open your page
              </p>
              <ul className="divide-y divide-border">
                {human.map((c) => (
                  <CrawlerRow key={c.bot} c={c} />
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="eyebrow mb-2 text-[0.6rem]">
              AI training &amp; indexing · automated crawlers
            </p>
            {indexing.length === 0 ? (
              <p className="text-sm text-muted">None yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {indexing.map((c) => (
                  <CrawlerRow key={c.bot} c={c} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

function Engagement({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Panel title="Click heatmap">
        <ClickHeatmap points={data.heatmap.points} />
      </Panel>
      <div className="space-y-6">
        <Panel title="Most-clicked targets">
          <BarList items={data.heatmap.topClicks} />
        </Panel>
        <Panel title="Section reach">
          <BarList items={data.sectionViews} />
        </Panel>
      </div>
    </div>
  );
}

function Conversations({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <Panel title="Top questions recruiters ask">
        <BarList items={data.topQuestions} emptyLabel="No chat questions yet." />
      </Panel>
      <Panel title={`Conversations (${data.conversations.length})`}>
        {data.conversations.length === 0 ? (
          <p className="text-sm text-muted">No conversations yet.</p>
        ) : (
          <div className="space-y-5">
            {data.conversations.map((c) => (
              <div
                key={c.sessionId}
                className="rounded-xl border border-border bg-surface-2/40 p-4"
              >
                <p className="eyebrow mb-3 text-[0.6rem]">
                  {relativeTime(c.createdAt)} · {c.messages.length} messages
                </p>
                <div className="space-y-2.5">
                  {c.messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        m.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          m.role === "user"
                            ? "rounded-br-md bg-foreground text-background"
                            : "border border-border bg-surface text-foreground",
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function JdAnalyses({ data }: { data: AnalyticsData }) {
  return (
    <Panel title={`JD-fit analyses (${data.recentJd.length})`}>
      {data.recentJd.length === 0 ? (
        <p className="text-sm text-muted">No JD analyses yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {data.recentJd.map((j, i) => (
            <div key={i} className="flex items-start gap-4 py-3">
              <span
                className={cn(
                  "mt-0.5 grid size-11 shrink-0 place-items-center rounded-xl font-display text-lg",
                  (j.fit_score ?? 0) >= 70
                    ? "bg-accent-soft text-accent-strong"
                    : "bg-surface-2 text-muted",
                )}
              >
                {j.fit_score ?? "—"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {j.role_title || "Untitled role"}
                  {j.company && (
                    <span className="text-muted"> · {j.company}</span>
                  )}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  {j.jd_text.slice(0, 180)}…
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-faint">
                {relativeTime(j.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Messages({ data }: { data: AnalyticsData }) {
  return (
    <Panel title={`Contact messages (${data.recentContacts.length})`}>
      {data.recentContacts.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {data.recentContacts.map((c, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-foreground">{c.name}</p>
                <span className="font-mono text-xs text-faint">
                  {relativeTime(c.created_at)}
                </span>
              </div>
              <a
                href={`mailto:${c.email}`}
                className="text-sm text-accent hover:underline"
              >
                {c.email}
              </a>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
