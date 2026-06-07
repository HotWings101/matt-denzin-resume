"use client";

import * as React from "react";
import {
  Eye,
  Users,
  MessageSquare,
  FileSearch,
  Mail,
  TrendingUp,
  Layers,
  HelpCircle,
  Target,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdminDashboardProps {
  totals: {
    pageViews: number;
    uniqueVisitors: number;
    chatQuestions: number;
    jdAnalyses: number;
    contacts: number;
  };
  topQuestions: { question: string; count: number }[];
  sectionViews: { section: string; count: number }[];
  daily: { day: string; views: number }[];
  recentJd: {
    role_title: string | null;
    company: string | null;
    fit_score: number | null;
    created_at: string;
  }[];
  recentContacts: {
    name: string;
    email: string;
    message: string;
    created_at: string;
  }[];
  headerAction?: React.ReactNode;
}

/** Compact date — "Jun 7" style, falls back gracefully on bad input. */
function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Day-bucket label for the bar chart axis. */
function formatDay(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Empty-state line shared across panels. */
function EmptyState({ children = "No data yet." }: { children?: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-faint">{children}</p>;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="card-paper rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 text-accent">
        {icon}
        <span className="eyebrow !text-muted">{label}</span>
      </div>
      <p className="mt-3 font-mono text-3xl font-medium tabular-nums tracking-tight text-foreground sm:text-4xl">
        {formatNumber(value)}
      </p>
    </div>
  );
}

interface PanelProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

function Panel({ icon, title, children, className }: PanelProps) {
  return (
    <section className={cn("card-paper rounded-2xl p-5 sm:p-6", className)}>
      <header className="mb-4 flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-base font-medium">{title}</h3>
      </header>
      {children}
    </section>
  );
}

/** Horizontal bar row — width is a percentage of the panel's max value. */
function BarRow({
  label,
  value,
  max,
  hint,
}: {
  label: string;
  value: number;
  max: number;
  hint?: string;
}) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="group">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="truncate text-sm text-foreground" title={hint ?? label}>
          {label}
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {formatNumber(value)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out group-hover:bg-accent-strong"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function AdminDashboard({
  totals,
  topQuestions,
  sectionViews,
  daily,
  recentJd,
  recentContacts,
  headerAction,
}: AdminDashboardProps) {
  const statCards: StatCardProps[] = [
    { icon: <Eye className="size-4" />, label: "Page views", value: totals.pageViews },
    {
      icon: <Users className="size-4" />,
      label: "Unique visitors",
      value: totals.uniqueVisitors,
    },
    {
      icon: <MessageSquare className="size-4" />,
      label: "Chat questions",
      value: totals.chatQuestions,
    },
    {
      icon: <FileSearch className="size-4" />,
      label: "JD analyses",
      value: totals.jdAnalyses,
    },
    { icon: <Mail className="size-4" />, label: "Contacts", value: totals.contacts },
  ];

  const dailyMax = daily.reduce((m, d) => Math.max(m, d.views), 0);
  const sectionMax = sectionViews.reduce((m, s) => Math.max(m, s.count), 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Internal · analytics</p>
          <h1 className="text-3xl md:text-[2.4rem]">Career site analytics</h1>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </header>

      <div className="rule my-8" />

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Two-column: daily views + section views */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          icon={<TrendingUp className="size-4" />}
          title={`Daily page views${daily.length ? ` · last ${daily.length} days` : ""}`}
        >
          {daily.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2.5">
              {daily.map((d) => (
                <BarRow
                  key={d.day}
                  label={formatDay(d.day)}
                  value={d.views}
                  max={dailyMax}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel icon={<Layers className="size-4" />} title="Most-viewed sections">
          {sectionViews.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {sectionViews.map((s) => (
                <BarRow
                  key={s.section}
                  label={s.section}
                  value={s.count}
                  max={sectionMax}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Top questions */}
      <Panel
        icon={<HelpCircle className="size-4" />}
        title="Top questions recruiters ask"
        className="mt-6"
      >
        {topQuestions.length === 0 ? (
          <EmptyState />
        ) : (
          <ol className="divide-y divide-border">
            {topQuestions.map((q, i) => (
              <li
                key={`${q.question}-${i}`}
                className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs tabular-nums text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground">{q.question}</span>
                </span>
                <Badge variant="mono" className="shrink-0 tabular-nums">
                  {formatNumber(q.count)}
                </Badge>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      {/* Two-column: recent JD + recent messages */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel icon={<Target className="size-4" />} title="Recent JD analyses">
          {recentJd.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="eyebrow px-1 pb-2 font-normal">Role / company</th>
                    <th className="eyebrow px-1 pb-2 text-center font-normal">Fit</th>
                    <th className="eyebrow px-1 pb-2 text-right font-normal">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentJd.map((jd, i) => (
                    <tr key={`${jd.created_at}-${i}`} className="align-top">
                      <td className="px-1 py-2.5">
                        <p className="font-medium text-foreground">
                          {jd.role_title ?? "Untitled role"}
                        </p>
                        {jd.company && (
                          <p className="text-xs text-muted">{jd.company}</p>
                        )}
                      </td>
                      <td className="px-1 py-2.5 text-center">
                        {jd.fit_score === null ? (
                          <span className="text-xs text-faint">—</span>
                        ) : (
                          <Badge variant="accent" className="tabular-nums">
                            {jd.fit_score}
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-2.5 text-right font-mono text-xs text-muted">
                        {formatDate(jd.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel icon={<Inbox className="size-4" />} title="Recent messages">
          {recentContacts.length === 0 ? (
            <EmptyState>No messages yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {recentContacts.map((c, i) => (
                <li key={`${c.email}-${i}`} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium text-foreground">{c.name}</p>
                    <time className="shrink-0 font-mono text-xs text-muted">
                      {formatDate(c.created_at)}
                    </time>
                  </div>
                  <a
                    href={`mailto:${c.email}`}
                    className="block truncate text-xs text-accent transition-colors hover:text-accent-strong"
                  >
                    {c.email}
                  </a>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
