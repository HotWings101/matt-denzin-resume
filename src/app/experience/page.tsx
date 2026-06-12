import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Section } from "@/components/site/section";
import { CompanyList } from "@/components/site/experience-timeline";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "The full work history of Matthew Denzin — fifteen years delivering enterprise web platforms, OEM digital programs, and workflow-automation products across the automotive ecosystem, with the complete detail behind each role.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1 pt-16">
        <Section
          id="experience-detail"
          eyebrow="Experience"
          title="The full work history."
          intro="The complete detail behind each role — results, responsibilities, and the tools and methods used to deliver them."
          grid
        >
          <CompanyList full />

          <div className="mt-14">
            <Link
              href="/#experience"
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
