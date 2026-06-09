/* eslint-disable @next/next/no-img-element -- small self-hosted institution logos */
import { education, certifications } from "@/data/resume";
import { Badge } from "@/components/ui/badge";
import { Section } from "./section";
import { Reveal } from "./reveal";

function LogoChip({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="inline-flex h-16 shrink-0 items-center rounded-xl border border-border bg-white px-4">
      <img
        src={src}
        alt={alt}
        className="h-9 w-auto max-w-[9rem] object-contain"
      />
    </span>
  );
}

export function EducationSection() {
  return (
    <Section
      id="education"
      index="03"
      eyebrow="Credentials"
      title="Education & certifications."
      grid
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {education.map((e, i) => (
          <Reveal key={e.school} delay={i * 0.06}>
            <article className="card-paper flex h-full flex-col gap-5 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                {e.logo && <LogoChip src={e.logo} alt={`${e.school} logo`} />}
                <div className="min-w-0">
                  <p className="eyebrow text-[0.6rem]">Education</p>
                  <h3 className="mt-1.5 font-display text-lg leading-snug text-foreground">
                    {e.school}
                  </h3>
                </div>
              </div>
              <div>
                <p className="text-[0.95rem] text-foreground/85">{e.detail}</p>
                <p className="mt-1 font-mono text-xs tracking-wide text-muted">
                  {e.years}
                </p>
                {e.activities && e.activities.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {e.activities.map((a) => (
                      <li key={a}>
                        <Badge variant="outline" className="text-[0.72rem]">
                          {a}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </Reveal>
        ))}

        {certifications.map((c, i) => (
          <Reveal key={c.name} delay={(education.length + i) * 0.06}>
            <article className="card-paper flex h-full flex-col gap-5 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                {c.logo && <LogoChip src={c.logo} alt={`${c.issuer} logo`} />}
                <div className="min-w-0">
                  <p className="eyebrow text-[0.6rem]">Certification</p>
                  <h3 className="mt-1.5 font-display text-lg leading-snug text-foreground">
                    {c.name}
                  </h3>
                </div>
              </div>
              <div>
                <p className="text-[0.95rem] text-foreground/85">{c.issuer}</p>
                <p className="mt-1 font-mono text-xs tracking-wide text-muted">
                  Issued {c.issued}
                  {c.credentialId && `  ·  Credential ID ${c.credentialId}`}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
