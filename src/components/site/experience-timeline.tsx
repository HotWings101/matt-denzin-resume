/* eslint-disable @next/next/no-img-element -- small self-hosted employer logos */
import { experience } from "@/data/resume";
import type { Position } from "@/data/resume";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/** A single position on a company's vertical rail. */
function PositionEntry({ position, delay }: { position: Position; delay: number }) {
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

      <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/80">
        {position.summary}
      </p>

      {/* Highlights — accent dot bullets */}
      <ul className="mt-4 space-y-2">
        {position.highlights.map((highlight) => (
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

export function ExperienceTimeline() {
  return (
    <Section
      id="experience"
      index="01"
      eyebrow="Experience"
      title="Fifteen years turning complex programs into shipped outcomes."
      grid
    >
      <div className="space-y-16 md:space-y-20">
        {experience.map((company, companyIndex) => (
          <Reveal key={company.name} delay={companyIndex * 0.04}>
            <article>
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
                  />
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
