/**
 * Crawlable, grounded FAQ — published as static HTML at /faq so search engines
 * and LLM answer-engines can read and cite Matt's answers directly (the career
 * chat is API-only and not crawlable). Every answer is faithful to the verified
 * data in resume.ts / knowledge.ts. GROUND TRUTH ONLY — no fabricated claims.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: "How does Matt use AI to run product delivery?",
    answer:
      "As Product Operations Manager at Cox Automotive, Matt uses AI across the entire WOMS delivery cycle: breaking end-user feature and enhancement requests into epics, features, and user stories; assigning priority, ranking, and scoring across the backlog; parsing the developer change log each sprint to generate QA test scenarios, acceptance criteria, and release notes; and producing weekly AI-generated recommendation decks for stakeholders. Applying AI this way absorbed work that would traditionally need 3-4 dedicated roles (business analyst, product owner, QA analyst, and change management), shifting his role toward Release Train Engineer-style coordination.",
  },
  {
    question: "What's his fintech and digital-retailing experience?",
    answer:
      "As Senior Technical Project Manager for OEM programs, Matt delivered digital-retailing initiatives on the fintech side of automotive, coordinating integrations across OEM incentive feeds, DMS (dealer management systems), and banks/lenders to connect dealers, customers, and financing partners through a single platform under strict accuracy and compliance requirements. During OEM site migrations he led a team that wired up DMS inventory and incentive feeds and stood up digital-retailing products, and he later ran a vehicle-pricing initiative that surfaced live dealer pricing on Google Vehicles for Sale.",
  },
  {
    question: "Tell me about the product he owns at Cox Automotive.",
    answer:
      "At Cox Automotive (May 2021-April 2026) Matt was Product Manager for WOMS, the Work Operations Management System, an enterprise product built on the Microsoft Power Platform. He owned the full lifecycle: vision and roadmap, discovery, requirements, build, release, and adoption. He ran user interviews and workflow analysis to find unmet needs, translated them into epics, user stories, and acceptance criteria, owned sprint planning and backlog refinement, designed QA scenarios, led UAT, and drove adoption across the SEO, HomeNet, AMP, and Autotrader business units.",
  },
  {
    question: "Has Matt led teams and managed budgets?",
    answer:
      "Yes. As Senior Production Project Manager at Dealertrack/Dealer.com he led a team of Implementation Project Managers delivering Ford Motor Company websites, managing workflow, forecasting output, setting monthly goals, and tracking KPIs. As Senior Technical Project Manager he owned scope, schedule, and budget across eight global OEM brands, building work breakdown structures, baselines, and risk strategies that kept projects under budget.",
  },
  {
    question: "Which automotive brands has he shipped programs for?",
    answer:
      "Matt has led enterprise website programs for eight global OEM brands: Audi, Ford, Lincoln, Genesis, Hyundai, Toyota, Lexus, and Honda. Earlier in his career he supported more than 250 Toyota dealership sites under the Enterprise Toyota GSM Program and delivered Ford Motor Company websites at production scale.",
  },
  {
    question: "What's his experience with vehicle pricing and inventory feeds?",
    answer:
      "Dealer vehicle pricing has run through every role in Matt's career. He has worked with dealer DMS feeds and OEM incentive feeds that drive the pricing shown on dealer websites, led teams that adjusted dealer pricing displays during OEM platform migrations, and ran a Managed Services initiative that re-engineered dealer inventory data exports so accurate pricing flowed from the dealer feed to the DBA platform and on to Google Vehicles for Sale.",
  },
  {
    question: "Has Matt actually built an AI product, or only managed them?",
    answer:
      "Both. He conceived, scoped, and shipped this very website, an AI-native product with a retrieval-augmented-generation (RAG) career chat that answers questions grounded in his résumé with citations, plus an LLM-powered job-description fit analyzer. He designed the grounding prompts to prevent hallucination, built the embeddings and vector search on Supabase pgvector, integrated the LLMs through the Vercel AI SDK (Google Gemini), and instrumented the product with a custom analytics pipeline, building it through AI-assisted development while owning the vision, scope, and QA end to end.",
  },
  {
    question: "Where is Matt based and how can I reach him?",
    answer:
      "Matt is based in the Dallas-Fort Worth Metroplex, Texas and is open to AI-first product and product/program management roles. He can be reached by email at mattdenzin@yahoo.com, by phone at (972) 489-6324, or on LinkedIn at linkedin.com/in/matt-denzin-pmp-6b326110.",
  },
];
