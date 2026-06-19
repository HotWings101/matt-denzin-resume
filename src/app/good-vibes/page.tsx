import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Section } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Good Vibes",
  description: "A little something outside the résumé.",
  alternates: { canonical: "/good-vibes" },
};

export default function GoodVibesPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1 pt-16">
        <Section
          id="good-vibes"
          eyebrow="Good Vibes"
          title="Good vibes."
          intro="A little something outside the résumé — press play."
          grid
        >
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
              <iframe
                title="Good Vibes"
                src="https://player.vimeo.com/video/1102461800?h=129d553561"
                className="absolute inset-0 h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mt-14">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Back home
            </Link>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
