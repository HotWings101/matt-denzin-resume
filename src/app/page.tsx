import { SiteNav } from "@/components/site/site-nav";
import { personJsonLd } from "@/lib/json-ld";
import { Hero } from "@/components/site/hero";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { EducationSection } from "@/components/site/education";
import { Skills } from "@/components/site/skills";
import { JdAnalyzer } from "@/components/site/jd-analyzer";
import { Recommendations } from "@/components/site/recommendations";
import { ContactForm } from "@/components/site/contact-form";
import { SiteFooter } from "@/components/site/site-footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://matt-denzin-resume.vercel.app";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(siteUrl)),
        }}
      />
      <SiteNav />
      <main id="main" className="flex-1">
        <Hero />
        <JdAnalyzer />
        <ExperienceTimeline />
        <Recommendations />
        <EducationSection />
        <Skills />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
