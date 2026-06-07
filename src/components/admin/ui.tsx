import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Counted } from "@/lib/analytics";

export function formatDuration(sec: number): string {
  if (!sec || sec < 0) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card-paper rounded-xl px-5 py-4">
      <p className="eyebrow text-[0.62rem]">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl leading-none",
          accent ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function BarList({
  items,
  emptyLabel = "No data yet.",
  accentClass = "bg-accent",
}: {
  items: Counted[];
  emptyLabel?: string;
  accentClass?: string;
}) {
  if (items.length === 0)
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-foreground">{it.key}</span>
            <span className="shrink-0 font-mono text-xs text-muted">
              {it.count}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn("h-full rounded-full", accentClass)}
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Vertical mini bar chart (e.g. daily page views). */
export function MiniBars({
  data,
}: {
  data: { day: string; views: number; visitors: number }[];
}) {
  if (data.length === 0)
    return <p className="text-sm text-muted">No data yet.</p>;
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="flex h-36 items-end gap-1">
      {data.map((d) => (
        <div
          key={d.day}
          className="group relative flex-1"
          title={`${d.day}: ${d.views} views · ${d.visitors} visitors`}
        >
          <div
            className="w-full rounded-t bg-accent/80 transition-colors group-hover:bg-accent"
            style={{ height: `${Math.max((d.views / max) * 100, 2)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("card-paper rounded-2xl p-5", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="eyebrow !text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
