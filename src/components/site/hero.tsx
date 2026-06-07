/* eslint-disable @next/next/no-img-element -- small self-hosted brand SVGs */
import { ArrowRight } from "lucide-react";
import { profile, stats, brandLogos } from "@/data/resume";
import { CareerChat } from "./career-chat";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section id="top" data-section="hero" className="relative overflow-hidden">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="bg-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.16), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-28 md:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
        {/* Left — positioning */}
        <div>
          <Reveal onMount>
            <p className="eyebrow flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              {profile.location} · Open to AI-first product roles
            </p>
          </Reveal>

          <Reveal onMount delay={0.06}>
            <h1 className="mt-5 text-[3.1rem] leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              {profile.name}
            </h1>
          </Reveal>

          <Reveal onMount delay={0.12}>
            <p className="mt-4 font-mono text-sm uppercase tracking-[0.18em] text-muted">
              {profile.roles.join("  ·  ")}
            </p>
          </Reveal>

          <Reveal onMount delay={0.18}>
            <div className="mt-6 h-px w-24 bg-clay/60" />
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80">
              {profile.pitch}
            </p>
          </Reveal>

          <Reveal onMount delay={0.26}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#experience"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[0.95rem] font-medium text-accent-foreground shadow-[0_8px_24px_-12px_rgba(79,70,229,0.6)] transition-all hover:bg-accent-strong active:scale-[0.98]"
              >
                Explore my work
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center rounded-full border border-border-strong bg-surface px-6 text-[0.95rem] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Get in touch
              </a>
            </div>
          </Reveal>

          {/* Stat strip */}
          <Reveal onMount delay={0.34}>
            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl text-foreground">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Right — the AI surface */}
        <Reveal onMount delay={0.2}>
          <div className="lg:pl-4">
            <CareerChat />
            <p className="mt-3 px-1 text-center text-sm text-muted">
              This site is itself an AI product — interrogate Matt&apos;s 15-year
              record in plain language.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Brand strip */}
      <Reveal onMount delay={0.4}>
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-14">
          <div className="rule mb-6" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="eyebrow shrink-0">Programs shipped for</span>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
              {brandLogos.map((b) => (
                <img
                  key={b.name}
                  src={b.src}
                  alt={b.name}
                  width={88}
                  height={24}
                  loading="lazy"
                  className="h-6 w-auto max-w-[5.5rem] object-contain opacity-55 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
