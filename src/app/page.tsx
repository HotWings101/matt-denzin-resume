import { SiteNav } from "@/components/site/site-nav";
import { personJsonLd, webSiteJsonLd } from "@/lib/json-ld";
import { Hero } from "@/components/site/hero";
import { EthosSection } from "@/components/site/ethos";
import { Section } from "@/components/site/section";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { CareerChat } from "@/components/site/career-chat";
import { SelectedProjectSection } from "@/components/site/selected-project";
import { EducationSection } from "@/components/site/education";
import { CapabilitiesTeaser } from "@/components/site/skills";
import { JdAnalyzer } from "@/components/site/jd-analyzer";
import { Recommendations } from "@/components/site/recommendations";
import { ContactForm } from "@/components/site/contact-form";
import { AlamoBanner } from "@/components/site/alamo-banner";
import { SiteFooter } from "@/components/site/site-footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://matthewdenzin.ai";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            personJsonLd(siteUrl),
            webSiteJsonLd(siteUrl),
          ]),
        }}
      />
      <SiteNav />
      <main id="main" className="flex-1">
        <Hero />
        <EthosSection />
        <JdAnalyzer />
        <ExperienceTimeline />
        <Section
          id="chat"
          eyebrow="Career chat"
          title="Interview my career."
          intro="Ask anything about my background. Answers are generated live and grounded in my résumé — with the sources they draw from cited."
          grid
        >
          <CareerChat className="mx-auto max-w-2xl" />
        </Section>
        <SelectedProjectSection />
        <Recommendations />
        <EducationSection />
        <CapabilitiesTeaser />
        <AlamoBanner />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
