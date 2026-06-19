import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Section } from "@/components/site/section";

export const metadata: Metadata = {
  title: "Let's Go!",
  description: "Turn it up — and let's go.",
  alternates: { canonical: "/lets-go" },
};

export default function LetsGoPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1 pt-16">
        <Section
          id="lets-go"
          eyebrow="Let's Go!"
          title="Thunderstruck."
          intro="Turn it up — and let's go."
          grid
        >
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
              <iframe
                title="Let's Go!"
                src="https://player.vimeo.com/video/448638592?h=22067c9cf0"
                className="absolute inset-0 h-full w-full"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="mt-14">
            <Link
              href="/#ethos"
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
