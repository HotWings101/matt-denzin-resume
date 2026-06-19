/* eslint-disable @next/next/no-img-element -- full-bleed statement artwork */
import Link from "next/link";
import { Reveal } from "./reveal";

/**
 * Alamo statement banner — a full-bleed, original Alamo-battle history painting
 * (bookending the hero's dusk Alamo) carrying the site's statement line.
 * Sits just above the Contact section, as a mid-page band.
 */
export function AlamoBanner() {
  return (
    <section
      data-section="statement"
      aria-label="Bold people with big ideas change the world"
      className="relative w-full overflow-hidden"
    >
      <img
        src="/textures/alamo-battle.jpg"
        alt="An original dawn history-painting tribute to the 1836 defenders of the Alamo, echoing the warm Texas light and constellation motif of the site's hero."
        width={1376}
        height={768}
        loading="lazy"
        className="h-[46vh] min-h-[340px] w-full object-cover object-center md:h-[58vh]"
      />

      {/* Legibility scrim — darkest through the vertical center where the line sits */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/45 to-black/20"
      />

      {/* Statement, centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <p className="font-display text-balance text-3xl leading-[1.1] tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-4xl md:text-5xl">
              <Link
                href="/why-not"
                className="transition-colors hover:text-accent"
              >
                Bold people with big ideas change the world.
              </Link>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/60">
                Further reading
              </span>
              <a
                href="https://mitsloan.mit.edu/ideas-made-to-matter/why-generative-ai-needs-a-creative-human-touch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/85 underline decoration-white/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                Why generative AI needs a creative human touch
                <span className="text-white/50"> · MIT Sloan</span>
              </a>
              <a
                href="https://www.microsoft.com/en-us/worklab/the-essential-human-skills-for-ai-success-focus-on-the-5cs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/85 underline decoration-white/30 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                The human skills for AI success: the 5 C&rsquo;s
                <span className="text-white/50"> · Microsoft</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
