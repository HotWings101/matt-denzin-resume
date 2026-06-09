import { recommendations } from "@/data/resume";
import { Section } from "./section";
import { Reveal } from "./reveal";

/**
 * Endorsements — editorial pull-quotes from former colleagues, rendered as a
 * 3-up grid of raised paper cards with a large decorative opening quote mark.
 * Server component.
 */
export function Recommendations() {
  return (
    <Section
      id="recommendations"
      index="05"
      eyebrow="Endorsements"
      title="What colleagues say."
      grid
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec, i) => (
          <Reveal key={rec.name} delay={i * 0.08} className="h-full">
            <figure className="card-paper relative flex h-full flex-col rounded-2xl p-7">
              <span
                aria-hidden
                className="font-display pointer-events-none absolute right-5 top-2 select-none text-7xl leading-none text-accent/15"
              >
                &rdquo;
              </span>
              <span
                aria-hidden
                className="font-display -mb-3 select-none text-6xl leading-none text-accent"
              >
                &ldquo;
              </span>
              <blockquote className="relative text-lg leading-relaxed text-foreground/90 text-pretty">
                {rec.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <span className="block font-medium text-foreground">
                  {rec.name}
                </span>
                <span className="block text-sm text-muted">{rec.role}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
