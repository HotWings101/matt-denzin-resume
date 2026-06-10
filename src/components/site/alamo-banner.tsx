/* eslint-disable @next/next/no-img-element -- full-bleed statement artwork */
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
              Bold people with big ideas change the world.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
