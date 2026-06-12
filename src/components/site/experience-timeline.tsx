/* eslint-disable @next/next/no-img-element -- small self-hosted employer logos */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { experience } from "@/data/resume";
import type { Position } from "@/data/resume";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { cn, slugify } from "@/lib/utils";

/** How many highlights to show before the "Full detail" link kicks in. */
const PREVIEW_HIGHLIGHTS = 3;

/** A single position on a company's vertical rail. */
function PositionEntry({
  position,
  delay,
  full,
}: {
  position: Position;
  delay: number;
  /** When true, render every highlight (detail page). Otherwise truncate. */
  full?: boolean;
}) {
  const highlights = full
    ? position.highlights
    : position.highlights.slice(0, PREVIEW_HIGHLIGHTS);

  return (
    <Reveal delay={delay} className="relative pb-10 pl-8 last:pb-0">
      {/* Node dot — accent, clay for the current role */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-[0.45rem] z-10 size-3 -translate-x-1/2 rounded-full ring-4 ring-background",
          position.current ? "bg-clay" : "bg-accent",
        )}
      />

      {/* Title + date range + Current badge */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <h4 className="text-lg font-medium leading-snug text-foreground">
          {position.title}
        </h4>
        {position.current && (
          <Badge variant="accent" className="px-2.5 py-0.5 text-xs">
            Current
          </Badge>
        )}
      </div>

      <p className="mt-1 font-mono text-[0.78rem] tracking-wide text-muted">
        {position.start} &ndash; {position.end}
      </p>

      {/* Result — the outcome-forward headline for the role */}
      {position.result && (
        <p className="mt-3 max-w-2xl rounded-lg border-l-2 border-accent bg-accent/[0.06] py-2 pl-3.5 pr-3 text-pretty text-[0.95rem] leading-relaxed text-foreground/90">
          <span className="mr-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
            Result
          </span>
          {position.result}
        </p>
      )}

      {position.summary && (
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/80">
          {position.summary}
        </p>
      )}

      {/* Highlights — accent dot bullets */}
      <ul className="mt-4 space-y-2">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2.5 text-[0.95rem] leading-relaxed text-foreground/80">
            <span
              aria-hidden
              className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-accent"
            />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>

      {/* Skills chips */}
      {position.skills && position.skills.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {position.skills.map((skill) => (
            <li key={skill}>
              <Badge variant="mono">{skill}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}

/**
 * The list of companies and their roles. Shared between the homepage
 * (truncated) and the /experience detail page (`full`).
 */
export function CompanyList({ full }: { full?: boolean }) {
  return (
    <div className="space-y-16 md:space-y-20">
      {experience.map((company, companyIndex) => {
        const hasMore = company.positions.some(
          (p) => p.highlights.length > PREVIEW_HIGHLIGHTS,
        );
        return (
          <Reveal key={company.name} delay={companyIndex * 0.04}>
            <article id={slugify(company.name)} className="scroll-mt-24">
              {/* Company header */}
              <header className="mb-7 flex items-start gap-4">
                {company.logo && (
                  <span className="mt-0.5 inline-flex h-11 shrink-0 items-center rounded-xl border border-border bg-white px-3 shadow-[0_1px_2px_rgba(27,24,19,0.05)]">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="h-5 w-auto max-w-[7rem] object-contain"
                    />
                  </span>
                )}
                <div>
                  <h3 className="font-display text-2xl leading-tight text-foreground md:text-[1.7rem]">
                    {company.name}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-pretty text-sm leading-relaxed text-muted">
                    <span className="text-foreground/70">{company.location}</span>
                    <span aria-hidden className="mx-2 text-faint">
                      /
                    </span>
                    {company.context}
                  </p>
                </div>
              </header>

              {/* Vertical hairline rail */}
              <div className="relative ml-1.5 border-l border-border-strong">
                {company.positions.map((position, positionIndex) => (
                  <PositionEntry
                    key={position.title}
                    position={position}
                    delay={positionIndex * 0.06}
                    full={full}
                  />
                ))}
              </div>

              {/* Link to the full detail for this company */}
              {!full && hasMore && (
                <Link
                  href={`/experience#${slugify(company.name)}`}
                  className="group mt-5 inline-flex items-center gap-1.5 pl-8 text-sm font-medium text-muted transition-colors hover:text-accent"
                >
                  Full detail
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title="Fifteen years turning complex programs into shipped outcomes."
      grid
    >
      {/* Texas truck banner — nods to the automotive industry behind the 15 years */}
      <Reveal>
        <figure className="mb-12 overflow-hidden rounded-2xl border border-border shadow-[0_8px_30px_-18px_rgba(27,24,19,0.5)] md:mb-16">
          <img
            src="/textures/experience-truck.jpg"
            alt="An aggressive lifted Texas pickup truck kicking up dust at golden-hour dusk — a nod to fifteen years built in the automotive industry."
            width={1376}
            height={768}
            className="h-44 w-full object-cover object-center sm:h-56 md:h-72"
          />
        </figure>
      </Reveal>

      <CompanyList />
    </Section>
  );
}
