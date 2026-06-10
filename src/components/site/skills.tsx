/* eslint-disable @next/next/no-img-element -- small self-hosted capability icons */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { competencies } from "@/data/resume";
import { Section } from "./section";
import { Reveal } from "./reveal";

/** A capability group's icon (or a mono index fallback). */
function GroupIcon({ icon, index }: { icon?: string; index: number }) {
  return icon ? (
    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background">
      <img src={icon} alt="" aria-hidden className="size-10 object-contain" />
    </span>
  ) : (
    <span aria-hidden className="font-mono text-xs tracking-[0.18em] text-accent">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/**
 * Full capabilities grid — every group with its skill chips.
 * Rendered on the dedicated /capabilities page.
 */
export function CapabilitiesGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {competencies.map((group, i) => (
        <Reveal key={group.label} delay={i * 0.06}>
          <article className="card-paper card-paper-hover flex h-full flex-col gap-5 rounded-2xl p-6">
            <header className="flex items-center gap-3.5">
              <GroupIcon icon={group.icon} index={i} />
              <h3 className="text-pretty text-lg leading-snug">{group.label}</h3>
            </header>

            <ul className="-m-1 flex flex-wrap">
              {group.items.map((item) => (
                <li key={item} className="p-1">
                  <span className="inline-flex items-center rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-[0.8rem] text-muted transition-colors hover:border-accent hover:text-accent">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Homepage teaser — capability group titles only, with a link through to the
 * full /capabilities page. Keeps the one-pager tight while staying discoverable.
 */
export function CapabilitiesTeaser() {
  return (
    <Section
      id="skills"
      index="06"
      eyebrow="Capabilities"
      title="A product leader's toolkit."
      intro="From AI product strategy to delivery and operations — the full range I lead across."
      grid
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competencies.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.05}>
            <article className="card-paper card-paper-hover flex h-full items-center gap-3.5 rounded-2xl p-4">
              <GroupIcon icon={group.icon} index={i} />
              <h3 className="text-pretty text-[0.95rem] font-medium leading-snug">
                {group.label}
              </h3>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-8">
          <Link
            href="/capabilities"
            className="inline-flex items-center gap-2 rounded-full border border-accent-ring/60 bg-accent-soft px-5 py-2 text-sm font-medium text-accent-strong transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            See full toolkit
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
