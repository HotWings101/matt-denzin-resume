/* eslint-disable @next/next/no-img-element -- hero banner + small brand SVGs */
import { ArrowRight } from "lucide-react";
import { profile, stats, brandLogos } from "@/data/resume";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section id="top" data-section="hero" className="relative">
      {/* Full-bleed cinematic hero image (Alamo · Texas dusk · future-tech) */}
      <div className="relative min-h-[88vh] w-full overflow-hidden">
        <img
          src="/hero/hero-banner.jpg"
          alt="The Alamo at dusk beneath a warm Texas sunset and a futuristic constellation data-grid sky, with the San Antonio skyline in the distance"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Scrims for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(20,18,14,0.88) 0%, rgba(20,18,14,0.42) 40%, rgba(20,18,14,0.12) 62%, rgba(20,18,14,0.38) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(20,18,14,0.55), transparent 65%)",
          }}
        />

        {/* Overlaid content, anchored bottom-left */}
        <div className="relative mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28">
          <div className="max-w-3xl">
            <Reveal onMount>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-white/70">
                <span className="inline-block size-1.5 rounded-full bg-accent" />
                {profile.location} · Open to AI-first product roles
              </p>
            </Reveal>

            <Reveal onMount delay={0.06}>
              <h1 className="mt-4 text-[3rem] leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
                {profile.name}
              </h1>
            </Reveal>

            <Reveal onMount delay={0.12}>
              <h2 className="mt-3 max-w-3xl text-balance text-[3rem] leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Built to lead. Engineered to scale.
              </h2>
            </Reveal>

            <Reveal onMount delay={0.18}>
              <p className="mt-5 font-mono text-sm uppercase tracking-[0.18em] text-white/75">
                {profile.roles.join("  ·  ")}
              </p>
            </Reveal>

            <Reveal onMount delay={0.26}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#ask"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-[0.95rem] font-medium text-accent-foreground shadow-[0_8px_30px_-10px_rgba(79,70,229,0.7)] transition-all hover:bg-accent-strong active:scale-[0.98]"
                >
                  Interview my career
                  <ArrowRight className="size-4" />
                </a>
                <a
                  href="#experience"
                  className="inline-flex h-12 items-center rounded-full border border-white/30 bg-white/5 px-6 text-[0.95rem] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  Explore my work
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal onMount delay={0.3}>
            <p className="mt-10 max-w-2xl text-pretty text-base leading-relaxed text-white/80">
              I design the processes and lead the cross-functional teams behind
              5,000+ launched websites — spanning fintech products, OEM
              integrations (incentives, DMS, and digital retailing), and SEO.
            </p>
          </Reveal>

          {/* Stat strip */}
          <Reveal onMount delay={0.34}>
            <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-3xl text-white">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-white/65">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Brand strip — on bone, below the image (centered) */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-9">
          <p className="eyebrow text-center">Programs shipped for</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-9 gap-y-5">
            {brandLogos.map((b) => (
              <img
                key={b.name}
                src={b.src}
                alt={b.name}
                width={112}
                height={32}
                loading="lazy"
                className="h-8 w-auto max-w-[7rem] object-contain opacity-60 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
