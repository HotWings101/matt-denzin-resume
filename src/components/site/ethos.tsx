/* eslint-disable @next/next/no-img-element -- heirloom photo, self-hosted */
import Link from "next/link";
import { Reveal } from "./reveal";

/**
 * Ethos — a personal interstitial between the hero and the JD-Fit analyzer.
 * A vintage photo of Matt's grandfather paired with the operating principle it
 * handed down. Not a numbered résumé section; an editorial beat that frames the
 * whole career with a bias for action before the work itself.
 */
export function EthosSection() {
  return (
    <section
      id="ethos"
      data-section="ethos"
      className="relative scroll-mt-24 py-20 md:py-28"
    >
      {/* Faint engineering grid, matching the other sections */}
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-6 md:grid-cols-[auto_1fr] md:gap-14">
        {/* Heirloom print — authentic sepia photo on a raised white mat, lightly
            tilted; straightens on hover for a pinned-snapshot warmth. */}
        <Reveal className="mx-auto md:mx-0">
          <figure className="card-paper w-[260px] rounded-2xl p-3 transition-transform duration-300 sm:w-[320px] md:w-[360px] md:-rotate-2 md:hover:rotate-0">
            <img
              src="/personal/grandfather-excelsior.jpg"
              alt="My grandfather as a young man, seated on his Excelsior motorcycle on a sunlit street, 1940s."
              width={1000}
              height={773}
              loading="lazy"
              className="h-auto w-full rounded-lg"
            />
          </figure>
        </Reveal>

        {/* The principle it handed down */}
        <Reveal delay={0.08}>
          <div>
            <p className="eyebrow mb-5">Ethos</p>
            <p className="font-display text-balance text-3xl leading-[1.12] tracking-tight text-foreground md:text-[2.6rem]">
              My grandfather taught me how to drive fast and take chances
              <span className="text-accent">
                {" "}&mdash;{" "}
                <Link
                  href="/lets-go"
                  className="underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  let&apos;s go!
                </Link>
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
