/* eslint-disable @next/next/no-img-element -- full-bleed AI-generated hero */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Are You a Dinosaur?",
  description: "Adapt — or go the way of the dinosaurs.",
  alternates: { canonical: "/are-you-a-dinosaur" },
};

export default function AreYouADinosaurPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1">
        <section
          id="are-you-a-dinosaur"
          className="relative min-h-[100svh] w-full overflow-hidden"
        >
          {/* Full-bleed asteroid-impact / T-rex hero */}
          <img
            src="/hero/are-you-a-dinosaur.jpg"
            alt="A Tyrannosaurus rex silhouetted on a ridge, roaring up at a flaming asteroid streaking down and impacting Earth on the horizon while other dinosaurs flee through a burning prehistoric landscape."
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Scrims for text legibility (warm dark, matching the homepage hero) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(20,18,14,0.85) 0%, rgba(20,18,14,0.4) 45%, rgba(20,18,14,0.2) 70%, rgba(20,18,14,0.55) 100%)",
            }}
          />

          {/* Headline + quote, raised slightly above center */}
          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
            <div className="-translate-y-[6vh]">
              <h1 className="font-display text-balance text-3xl font-medium leading-[1.1] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)] sm:text-4xl md:text-5xl">
                Don&apos;t be a dinosaur.
              </h1>
              <figure className="mt-6">
                <blockquote className="font-display text-balance text-lg font-medium leading-snug text-white/90 [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-xl md:text-2xl">
                  &ldquo;It is not the strongest of the species that survives, nor
                  the most intelligent, but the one that is most adaptable to
                  change.&rdquo;
                </blockquote>
                <figcaption className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/65">
                  &mdash; Leon C. Megginson
                </figcaption>
              </figure>
            </div>
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
