/* eslint-disable @next/next/no-img-element -- full-bleed AI-generated hero */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Texas",
  description: "Everything is bigger in Texas.",
  alternates: { canonical: "/texas" },
};

export default function TexasPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1">
        <section
          id="texas"
          className="relative min-h-[100svh] w-full overflow-hidden"
        >
          {/* Full-bleed Texas collage hero */}
          <img
            src="/hero/texas.jpg"
            alt="A bold collage of Texas icons: the Texas State Capitol front and center, the Dallas and Houston skylines, the Alamo, the Lone Star flag, oil derricks, a monster truck, a football, a cowboy hat, and longhorn cattle under a golden Texas sunset."
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Scrims for text legibility (warm dark, matching the homepage hero) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(20,18,14,0.82) 0%, rgba(20,18,14,0.35) 45%, rgba(20,18,14,0.15) 68%, rgba(20,18,14,0.5) 100%)",
            }}
          />

          {/* Wordmark, centered */}
          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
            <h1 className="font-display text-6xl font-medium leading-[0.95] tracking-tight text-white [text-shadow:0_3px_30px_rgba(0,0,0,0.7)] sm:text-7xl md:text-8xl">
              Texas
            </h1>
          </div>

          {/* Back link */}
          <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Back home
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
