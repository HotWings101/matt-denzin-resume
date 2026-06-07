import { competencies } from "@/data/resume";
import { Section } from "./section";
import { Reveal } from "./reveal";

/**
 * Capabilities / Skills — the product leader's toolkit.
 * Renders the typed `competencies` groups as a responsive grid of paper cards,
 * each with a mono index, group label, and the items as gently interactive chips.
 */
export function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      eyebrow="Capabilities"
      title="A product leader's toolkit."
      grid
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {competencies.map((group, i) => (
          <Reveal key={group.label} delay={i * 0.06}>
            <article className="card-paper flex h-full flex-col gap-5 rounded-2xl p-6">
              <header className="flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="font-mono text-xs tracking-[0.18em] text-accent"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-pretty text-lg leading-snug">
                  {group.label}
                </h3>
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
    </Section>
  );
}
