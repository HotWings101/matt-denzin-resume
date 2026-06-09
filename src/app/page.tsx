import { SiteNav } from "@/components/site/site-nav";
import { personJsonLd } from "@/lib/json-ld";
import { Hero } from "@/components/site/hero";
import { Section } from "@/components/site/section";
import { CareerChat } from "@/components/site/career-chat";
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
        <Section
          id="ask"
          eyebrow="AI concierge"
          title="Ask my career anything."
          intro="This site is its own AI product — interrogate Matt's 15-year record in plain language and get grounded answers, with sources."
          grid
        >
          <div className="mx-auto max-w-2xl">
            <CareerChat />
          </div>
        </Section>
        <ExperienceTimeline />
        <EducationSection />
        <Skills />
        <Recommendations />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
