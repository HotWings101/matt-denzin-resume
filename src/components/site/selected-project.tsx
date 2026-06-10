/* eslint-disable @next/next/no-img-element -- small self-hosted capability icon */
import { selectedProject } from "@/data/resume";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { Reveal } from "./reveal";

/**
 * Selected Project — the featured self-directed build (this very site),
 * promoted to its own section just above Endorsements.
 */
export function SelectedProjectSection() {
  const p = selectedProject;
  return (
    <Section
      id="selected-project"
      index="03"
      eyebrow="Selected Project"
      title="The proof is the page you're on."
      grid
    >
      <Reveal>
        <article className="card-paper overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-accent-soft/50 px-6 py-3">
            <span className="eyebrow !text-accent-strong">Shipped &amp; live</span>
            <span className="font-mono text-[0.7rem] text-muted">
              {p.timeframe}
            </span>
          </div>
          <div className="p-6 md:p-7">
            <header className="flex items-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background">
                <img
                  src="/icons/cap-ai-innovation.jpg"
                  alt=""
                  aria-hidden
                  className="size-10 object-contain"
                />
              </span>
              <div>
                <h3 className="font-display text-2xl leading-tight text-foreground md:text-[1.7rem]">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{p.role}</p>
              </div>
            </header>

            <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-foreground/80">
              {p.summary}
            </p>

            <ul className="mt-4 space-y-2">
              {p.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-2.5 text-[0.95rem] leading-relaxed text-foreground/80"
                >
                  <span
                    aria-hidden
                    className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s}>
                  <Badge variant="mono">{s}</Badge>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent-ring/60 bg-accent-soft px-4 py-1.5 text-sm font-medium text-accent-strong transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {l.label}
                  <span aria-hidden>→</span>
                </a>
              ))}
            </div>
          </div>
        </article>
      </Reveal>
    </Section>
  );
}
