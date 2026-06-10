import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Section } from "@/components/site/section";
import { CapabilitiesGrid } from "@/components/site/skills";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "The full product-leadership toolkit of Matthew Denzin — AI product strategy, product management, program leadership, technical delivery, operations, methodologies, and the platforms he builds on.",
  alternates: { canonical: "/capabilities" },
};

export default function CapabilitiesPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1 pt-16">
        <Section
          id="capabilities"
          eyebrow="Capabilities"
          title="A product leader's toolkit."
          intro="The full range I lead across — from AI product strategy and LLM application design to delivery, operations, and the platforms I build on."
          grid
        >
          <CapabilitiesGrid />

          <div className="mt-14">
            <Link
              href="/#skills"
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Back to overview
            </Link>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
