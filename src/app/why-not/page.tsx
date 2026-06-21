import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Why Not?",
  description:
    "I dream things that never were; and I say ‘Why not?’ — George Bernard Shaw",
  alternates: { canonical: "/why-not" },
};

export default function WhyNotPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1">
        <section
          id="why-not"
          className="relative min-h-[100svh] w-full overflow-hidden"
        >
          {/* Full-bleed rocket-launch hero */}
          <Image
            src="/hero/why-not.jpg"
            alt="A space shuttle rocket launching off the pad at golden-hour dawn, with massive plumes of fire and billowing smoke against a dramatic warm sky."
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Scrims for text legibility (warm dark, matching the homepage hero) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(20,18,14,0.85) 0%, rgba(20,18,14,0.45) 45%, rgba(20,18,14,0.2) 70%, rgba(20,18,14,0.55) 100%)",
            }}
          />

          {/* Quote, centered */}
          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
            <figure>
              <blockquote className="font-display text-balance text-3xl font-medium leading-[1.18] tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
                &ldquo;You see things; you say, &lsquo;Why?&rsquo; But I dream
                things that never were; and I say &lsquo;Why not?&rsquo;&rdquo;
              </blockquote>
              <figcaption className="mt-7 font-mono text-xs uppercase tracking-[0.22em] text-white/75">
                &mdash; George Bernard Shaw
              </figcaption>
            </figure>
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
