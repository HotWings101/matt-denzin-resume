import {
  profile,
  competencies,
  certifications,
  education,
  experience,
} from "@/data/resume";

/**
 * schema.org Person JSON-LD — lets Google + LLM answer-engines reliably
 * understand "who Matt is" and cite this site as the canonical profile.
 */
export function personJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.shortName,
    jobTitle: "AI-first Product Manager",
    description: profile.pitch,
    url: siteUrl,
    image: `${siteUrl}/og.jpg`,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dallas–Fort Worth Metroplex",
      addressRegion: "TX",
      addressCountry: "US",
    },
    homeLocation: {
      "@type": "Place",
      name: "Dallas–Fort Worth Metroplex, Texas, USA",
    },
    sameAs: [profile.linkedin, "https://github.com/HotWings101"],
    knowsAbout: [
      "AI Product Management",
      "Large Language Models",
      "Retrieval-Augmented Generation",
      ...competencies.flatMap((g) => g.items),
    ],
    hasCredential: certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: c.name.replace(/®/g, "").trim(),
    })),
    alumniOf: education.map((e) => ({
      "@type": "CollegeOrUniversity",
      name: e.school,
    })),
    worksFor: { "@type": "Organization", name: experience[0]?.name },
  };
}

/**
 * schema.org WebSite JSON-LD — helps search + answer-engines understand the
 * site as a distinct entity and attribute it to Matt.
 */
export function webSiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${profile.name} — Portfolio`,
    url: siteUrl,
    inLanguage: "en-US",
    author: { "@type": "Person", name: profile.name, url: siteUrl },
  };
}
