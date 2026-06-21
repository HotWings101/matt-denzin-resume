import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Section } from "@/components/site/section";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ — About Matt Denzin",
  description:
    "Common questions about Matt Denzin's experience: AI-assisted product delivery, fintech & digital retailing, the WOMS product he owns at Cox Automotive, team leadership, the OEM brands he's shipped for, and how to reach him.",
  alternates: { canonical: "/faq" },
};

/** schema.org FAQPage — visible Q&A below mirrors this exactly, for rich results. */
function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <SiteNav />
      <main id="main" className="flex-1 pt-16">
        <Section
          id="faq"
          eyebrow="FAQ"
          title="Common questions about Matt."
          intro="Quick, grounded answers about Matt Denzin's background — the same verified source of truth behind the career chat."
          grid
        >
          <dl className="max-w-3xl space-y-8">
            {faq.map((f) => (
              <div key={f.question}>
                <dt className="font-display text-xl leading-snug text-foreground">
                  {f.question}
                </dt>
                <dd className="mt-2 text-pretty leading-relaxed text-muted">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>

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
