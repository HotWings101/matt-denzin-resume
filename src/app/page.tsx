import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { Skills } from "@/components/site/skills";
import { JdAnalyzer } from "@/components/site/jd-analyzer";
import { Recommendations } from "@/components/site/recommendations";
import { ContactForm } from "@/components/site/contact-form";
import { SiteFooter } from "@/components/site/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex-1">
        <Hero />
        <ExperienceTimeline />
        <Skills />
        <JdAnalyzer />
        <Recommendations />
        <ContactForm />
      </main>
      <SiteFooter />
    </>
  );
}
