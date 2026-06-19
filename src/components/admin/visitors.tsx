"use client";

import { useState, type ComponentType } from "react";
import {
  MapPin,
  Monitor,
  Smartphone,
  MousePointerClick,
  MessageSquare,
  ChevronDown,
  Clock,
  ArrowDownWideNarrow,
  Eye,
  PanelTop,
  LogOut,
  Mail,
  Target,
  Gauge,
} from "lucide-react";
import type { VisitorSession, VisitorEvent } from "@/lib/visitors";
import { isInternalReferrer } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Panel, formatDuration, relativeTime } from "./ui";

/** "Visitors" tab — drill-down list of sessions with an expandable journey timeline.
 *  Mount: <VisitorsTab sessions={sessions} /> (sessions: VisitorSession[]). */
export function VisitorsTab({ sessions }: { sessions: VisitorSession[] }) {
  const [showBots, setShowBots] = useState(false);

  const ordered = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const humans = ordered.filter((s) => s.botVerdict === "human");
  const bots = ordered.filter((s) => s.botVerdict !== "human");
  const visible = showBots ? ordered : humans;

  return (
    <Panel
      title={`Visitors (${humans.length})`}
      action={
        bots.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowBots((v) => !v)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            {showBots ? "Hide bots" : `Show bots (${bots.length})`}
          </button>
        ) : undefined
      }
    >
      {visible.length === 0 ? (
        <p className="text-sm text-muted">No visitor sessions yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((s) => (
            <SessionRow key={s.sessionId} session={s} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function SessionRow({ session: s }: { session: VisitorSession }) {
  const [open, setOpen] = useState(false);

  const visitorLabel = s.visitorId?.slice(0, 10) || "anon";
  const refLabel = friendlyReferrer(s.referrer);
  // Hide the referrer chip when it just restates the source bucket (e.g. LinkedIn · LinkedIn).
  const showRef = refLabel ? !sourceImplies(s.source, refLabel) : false;
  const place = [s.city, s.country].filter(Boolean).join(", ");
  const DeviceIcon =
    s.device && /mobile|phone|tablet/i.test(s.device) ? Smartphone : Monitor;
  const deviceLabel = [s.device, s.browser].filter(Boolean).join(" · ");

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-surface-2/40"
      >
        {/* Visitor id + time */}
        <div className="min-w-0 basis-48 shrink-0">
          <p className="flex items-center gap-1.5 font-mono text-sm text-foreground">
            <span className="min-w-0 truncate">{visitorLabel}</span>
            {s.botVerdict !== "human" ? (
              <span
                title={s.botReasons.join(" · ") || s.botVerdict}
                className="rounded-full bg-clay/10 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-clay"
              >
                {s.botVerdict === "bot" ? "Bot" : "Likely bot"}
              </span>
            ) : s.visitorType === "returning" ? (
              <span className="rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-accent-strong">
                Return ×{s.visitCount}
              </span>
            ) : (
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-wide text-muted">
                New
              </span>
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-2 font-mono text-[0.68rem] text-faint">
            {relativeTime(s.startedAt)}
            <span className="shrink-0 text-muted">· {s.source}</span>
            {showRef && (
              <span
                title={s.referrer ?? undefined}
                className="min-w-0 truncate text-faint"
              >
                · {refLabel}
              </span>
            )}
            {s.highIntent && (
              <span title={s.intentReasons.join(" · ")} className="text-accent">
                ★ intent
              </span>
            )}
          </p>
        </div>

        {/* Location */}
        <Cell icon={MapPin} className="hidden basis-40 sm:flex">
          {place || "Unknown"}
        </Cell>

        {/* Device + browser */}
        <Cell icon={DeviceIcon} className="hidden basis-44 md:flex">
          {deviceLabel || "—"}
        </Cell>

        {/* Duration + scroll */}
        <div className="ml-auto flex shrink-0 items-center gap-3 font-mono text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-faint" />
            {formatDuration(s.durationSec)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowDownWideNarrow className="size-3.5 text-faint" />
            {s.maxScroll}%
          </span>
          <span className="inline-flex items-center gap-1 text-faint">
            <Eye className="size-3.5" />
            {s.pageViews}
          </span>
          <span
            title="Engagement quality (0-100)"
            className="inline-flex items-center gap-1 text-faint"
          >
            <Gauge className="size-3.5" />
            {s.engagement}
          </span>
        </div>

        {/* Activity indicators */}
        <div className="flex shrink-0 items-center gap-1.5">
          {s.conversation.length > 0 && (
            <Indicator
              icon={MessageSquare}
              title={`Chatted (${s.conversation.length} messages)`}
            />
          )}
          {s.contact && <Indicator icon={Mail} title="Submitted contact" />}
          {s.jd.length > 0 && (
            <Indicator icon={Target} title={`Ran JD analysis (${s.jd.length})`} />
          )}
        </div>

        {/* Engagement badge */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide",
            s.bounced
              ? "bg-clay/10 text-clay"
              : "bg-accent-soft text-accent-strong",
          )}
        >
          {s.bounced ? "Bounced" : "Engaged"}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-5 pb-5 pl-2 pr-1 sm:pl-44">
          <Journey events={s.journey} />

          {s.conversation.length > 0 && (
            <Conversation messages={s.conversation} />
          )}

          {s.contact && (
            <Detail label="Contact message">
              <p className="font-medium text-foreground">{s.contact.name}</p>
              <a
                href={`mailto:${s.contact.email}`}
                className="text-sm text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {s.contact.email}
              </a>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {s.contact.message}
              </p>
            </Detail>
          )}

          {s.jd.length > 0 && (
            <Detail label="JD analyses">
              <div className="flex flex-wrap gap-2">
                {s.jd.map((j, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs"
                  >
                    <span className="text-foreground">
                      {j.roleTitle || "Untitled role"}
                      {j.company && (
                        <span className="text-muted"> · {j.company}</span>
                      )}
                    </span>
                    {j.fitScore != null && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 font-mono text-[0.6rem]",
                          j.fitScore >= 70
                            ? "bg-accent-soft text-accent-strong"
                            : "bg-surface-2 text-muted",
                        )}
                      >
                        {j.fitScore}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Detail>
          )}
        </div>
      )}
    </li>
  );
}

/* ---------- journey timeline ---------- */

type IconType = ComponentType<{ className?: string }>;

function Journey({ events }: { events: VisitorEvent[] }) {
  if (events.length === 0)
    return <p className="text-sm text-muted">No events recorded.</p>;

  return (
    <div>
      <p className="eyebrow mb-3 text-[0.6rem]">Journey</p>
      <ol className="relative space-y-3 border-l border-border pl-5">
        {events.map((ev, i) => {
          const { icon: Icon, label } = describeEvent(ev);
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[1.625rem] top-0.5 grid size-5 place-items-center rounded-full bg-surface ring-1 ring-border">
                <Icon className="size-3 text-accent" />
              </span>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground">{label}</span>
                <span className="shrink-0 font-mono text-[0.6rem] text-faint">
                  {relativeTime(ev.createdAt)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function describeEvent(ev: VisitorEvent): { icon: IconType; label: string } {
  const m = ev.meta ?? {};
  switch (ev.type) {
    case "page_view":
      return { icon: PanelTop, label: "Viewed page" };
    case "section_view":
      return { icon: Eye, label: `Saw ${str(m.section) ?? "section"}` };
    case "scroll_depth":
      return {
        icon: ArrowDownWideNarrow,
        label: `Scrolled ${num(m.depth) ?? "?"}%`,
      };
    case "click":
      return {
        icon: MousePointerClick,
        label: `Clicked ${str(m.label) ?? "element"}`,
      };
    case "page_exit": {
      const ms = num(m.durationMs);
      const dur = ms != null ? formatDuration(Math.round(ms / 1000)) : "—";
      return { icon: LogOut, label: `Left (${dur})` };
    }
    default:
      return { icon: Clock, label: humanize(ev.type) };
  }
}

/* ---------- chat ---------- */

function Conversation({
  messages,
}: {
  messages: { role: string; content: string }[];
}) {
  return (
    <Detail label="Conversation">
      <div className="space-y-2.5">
        {messages.map((m, i) => (
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
    </Detail>
  );
}

/* ---------- small primitives ---------- */

function Cell({
  icon: Icon,
  children,
  className,
}: {
  icon: IconType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "min-w-0 items-center gap-1.5 text-xs text-muted",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0 text-faint" />
      <span className="truncate">{children}</span>
    </span>
  );
}

function Indicator({ icon: Icon, title }: { icon: IconType; title: string }) {
  return (
    <span
      title={title}
      className="grid size-6 place-items-center rounded-md bg-surface-2 text-accent"
    >
      <Icon className="size-3.5" />
    </span>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-4">
      <p className="eyebrow mb-3 text-[0.6rem]">{label}</p>
      {children}
    </div>
  );
}

/* ---------- meta helpers ---------- */

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
/** Referring site's hostname (www-stripped), or null for direct/unparseable. */
function domainOf(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40) || null;
  }
}

/** Map common referrer hosts to recognizable product names. Order = priority. */
const HOST_LABELS: { re: RegExp; label: string }[] = [
  { re: /teams\.(microsoft\.com|cdn\.office\.net)|teams\.live\.com/, label: "Microsoft Teams" },
  { re: /outlook\.(office|office365|live)\.com|(^|\.)outlook\.com/, label: "Outlook" },
  { re: /mail\.google\.com/, label: "Gmail" },
  { re: /(^|\.)slack\.com|slack-redir/, label: "Slack" },
  { re: /discord(app)?\.com/, label: "Discord" },
  { re: /(^|\.)t\.me$|(^|\.)telegram\./, label: "Telegram" },
  { re: /whatsapp\.com|(^|\.)wa\.me/, label: "WhatsApp" },
  { re: /lnkd\.in|(^|\.)linkedin\.com/, label: "LinkedIn" },
  { re: /(^|\.)github\.(com|io)/, label: "GitHub" },
  { re: /(^|\.)notion\.(so|site)/, label: "Notion" },
  { re: /docs\.google\.com/, label: "Google Docs" },
  { re: /(^|\.)substack\.com/, label: "Substack" },
  { re: /(^|\.)medium\.com/, label: "Medium" },
  { re: /(^|\.)reddit\.com/, label: "Reddit" },
  { re: /(^|\.)youtube\.com|youtu\.be/, label: "YouTube" },
  { re: /(^|\.)t\.co$|(^|\.)x\.com|twitter\.com/, label: "X / Twitter" },
  { re: /facebook\.com|fb\.me/, label: "Facebook" },
  { re: /(^|\.)instagram\.com/, label: "Instagram" },
  { re: /(^|\.)indeed\.com/, label: "Indeed" },
  { re: /(^|\.)glassdoor\./, label: "Glassdoor" },
  { re: /ziprecruiter\.com/, label: "ZipRecruiter" },
  { re: /(^|\.)dice\.com/, label: "Dice" },
  { re: /(^|\.)google\./, label: "Google" },
  { re: /(^|\.)bing\.com/, label: "Bing" },
  { re: /duckduckgo\.com/, label: "DuckDuckGo" },
];

/** Friendly product name for a referrer, falling back to the bare hostname.
 *  Returns null for our own domains (self-referrals) so no chip is shown. */
function friendlyReferrer(referrer: string | null): string | null {
  if (isInternalReferrer(referrer)) return null;
  const host = domainOf(referrer);
  if (!host) return null;
  for (const h of HOST_LABELS) if (h.re.test(host)) return h.label;
  return host;
}

/** True when the referrer label just restates the traffic-source bucket. */
function sourceImplies(source: string, label: string): boolean {
  const s = source.toLowerCase();
  const l = label.toLowerCase();
  return s.includes(l) || l.includes(s);
}
function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
function humanize(type: string): string {
  const s = type.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
