/**
 * Curated knowledge base for the "Interview my career" RAG chat.
 *
 * Each passage is written to be retrieval-friendly: self-contained, factual, and
 * phrased the way a recruiter might ask about it. `scripts/ingest.ts` embeds
 * these passages (alongside auto-generated passages from `resume.ts`) into the
 * `resume_chunks` table in Supabase.
 *
 * GROUND TRUTH ONLY. Do not add claims that aren't supported by the résumé.
 */

export interface KnowledgePassage {
  id: string;
  /** Short human topic, surfaced as a citation label. */
  topic: string;
  /** Optional company/section the passage maps to, for citation chips. */
  source?: string;
  content: string;
  tags: string[];
}

export const knowledge: KnowledgePassage[] = [
  {
    id: "overview",
    topic: "Career overview",
    source: "Summary",
    content:
      "Matthew Denzin is a PMP-certified Product Operations Manager and product/technical leader based in the Dallas–Fort Worth Metroplex with 15+ years of experience. He delivers enterprise web platforms, OEM digital programs, and cross-functional technology initiatives. His core strengths are Agile product delivery, sprint planning, backlog refinement, product roadmapping, UAT/QA oversight, and release management. He has led engineering, product, design, and operations teams across complex, multi-brand automotive ecosystems and is known for transparent communication, measurable outcomes, and a get-it-done leadership style.",
    tags: ["summary", "overview", "product", "operations"],
  },
  {
    id: "ai-fit",
    topic: "Why an AI-first product role",
    source: "Positioning",
    content:
      "Matt is targeting AI-first Product Manager and Product/Program leadership roles. His background maps directly to AI product work: he runs customer discovery to find high-impact problems, translates ambiguity into epics, user stories, and acceptance criteria, and builds KPI frameworks (cycle time, rework volume, throughput) to measure whether a product is actually working. At Cox Automotive he owns a workflow-automation product built on the Microsoft Power Platform — using Power Automate, Dataverse, and model-driven apps to remove manual effort — which is the same automation-and-measurement mindset that AI products require. This website itself is an example: he scoped, shipped, and instrumented an AI-native product (a retrieval-grounded career chat and a job-description fit analyzer) as a working proof of his product thinking.",
    tags: ["ai", "product management", "positioning", "automation"],
  },
  {
    id: "woms-product",
    topic: "WOMS — the product he owned at Cox",
    source: "Cox Automotive · Product Operations Manager",
    content:
      "At Cox Automotive (May 2021–April 2026) Matt was the Product Manager for WOMS, the Work Operations Management System — an enterprise product built on the Microsoft Power Platform. He owned the full product lifecycle: vision and roadmap, discovery, requirements, build, release, and adoption. He ran user interviews and workflow analysis across business units to find unmet needs, then translated them into epics, features, user stories, and acceptance criteria. He owned sprint planning and backlog refinement, designed QA test scenarios, led UAT cycles, and validated release readiness before production. He standardized onboarding, training, and adoption across the SEO, HomeNet, AMP, and Autotrader business units to drive consistent platform engagement.",
    tags: ["cox", "woms", "power platform", "product lifecycle"],
  },
  {
    id: "oem-programs",
    topic: "Enterprise OEM website programs",
    source: "Cox Automotive · Sr. Technical Project Manager – OEM",
    content:
      "From March 2017 to May 2021 Matt was Senior Technical Project Manager for OEM programs, leading enterprise website programs across multiple global automotive brands: Audi, Ford, Lincoln, Genesis, Hyundai, Toyota, Lexus, and Honda. He managed the full project lifecycle for platform upgrades, rebranding, product add-ons, and workflow automation. He controlled scope, schedule, and budget while building work breakdown structures, baselines, risk strategies, and technical implementation plans, and forecasted implementation output, team capacity, and KPI performance for portfolio-level planning. He contributed to PMO governance by standardizing processes, templates, and lessons-learned to reduce future project costs.",
    tags: ["oem", "program management", "automotive", "budget", "risk", "pmo"],
  },
  {
    id: "team-leadership",
    topic: "Leading teams",
    source: "Dealertrack / Dealer.com",
    content:
      "Matt has direct people-leadership experience. As Senior Production Project Manager at Dealertrack/Dealer.com (Nov 2014–Feb 2017) he led a team of Implementation Project Managers delivering Ford Motor Company websites. He managed production workflow, delegated builds, ensured on-time delivery, forecasted output, set monthly team goals, and tracked KPIs for leadership reporting. He resolved escalations, removed bottlenecks, improved processes, and facilitated daily Scrum and cross-team communication. Recommenders describe his leadership as outstanding and credit him with making the workplace one where everyone felt like a critical part of the team's success.",
    tags: ["leadership", "team", "scrum", "delivery", "ford"],
  },
  {
    id: "branding-technical",
    topic: "Hands-on technical & creative work",
    source: "Dealertrack / Dealer.com · Sr. Branding Specialist",
    content:
      "Matt is not a hands-off manager — he has built things himself. As Senior Branding Specialist at Dealer.com (May 2012–Nov 2014) he directed creative and technical onboarding for new dealership clients, developing branding strategies, creative briefs, and website mockups. He implemented assets directly using HTML, CSS, and JavaScript, performed QA, proofreading, and content validation, and advised clients on SEO and SEM while ensuring compliance with Ford and Lincoln brand standards. That hands-on background means he can talk credibly with engineers and designers.",
    tags: ["html", "css", "javascript", "branding", "seo", "design"],
  },
  {
    id: "clickmotive-support",
    topic: "Scaled customer & release operations",
    source: "ClickMotive · Digital Advisor / Account Executive",
    content:
      "Early in his career at ClickMotive (May 2010–May 2012) Matt supported more than 250 Toyota dealership websites under the Enterprise Toyota GSM Program. He led daily escalation and training calls with GSM support teams, conducted monthly performance reviews with MAG and VIP dealers, and coordinated platform releases, bug prioritization, and escalations with development and engineering. He also trained and onboarded new hires. This is where he learned to operate at scale, manage stakeholders, and coordinate releases across support and engineering.",
    tags: ["clickmotive", "toyota", "support", "release management", "scale"],
  },
  {
    id: "methodologies",
    topic: "Methodologies & delivery approach",
    source: "Core competencies",
    content:
      "Matt works fluently across Agile, Scrum, Kanban, Waterfall, and hybrid delivery models, choosing the approach that fits the program rather than dogmatically applying one. His product toolkit includes roadmapping, backlog prioritization, sprint planning, user stories, and acceptance criteria. His program toolkit includes scope/schedule/budget control, RAID (risks, assumptions, issues, dependencies) management, and PMO governance. He builds KPI frameworks and uses performance data — cycle time, rework, throughput — to drive prioritization and continuous improvement.",
    tags: ["agile", "scrum", "kanban", "waterfall", "kpi", "raid", "roadmap"],
  },
  {
    id: "tools",
    topic: "Tools & platforms",
    source: "Core competencies",
    content:
      "Matt's working toolset includes Salesforce Lightning, Smartsheet, Jira, Confluence, Azure DevOps, Power BI, and the Microsoft Power Platform (model-driven apps, Dataverse, Power Automate). He also works directly in HTML, CSS, and JavaScript. He uses these for workflow automation, API and system integrations, KPI reporting and dashboards, and digital-retailing and website-platform delivery.",
    tags: ["tools", "salesforce", "jira", "power bi", "azure devops", "power platform"],
  },
  {
    id: "education-cert",
    topic: "Education & certifications",
    source: "Education",
    content:
      "Matt holds a B.A. in Advertising with a minor in Marketing from the University of North Texas, Mayborn School of Journalism (2004–2008), where he was active in the Advertising Club, the Tau Sigma Honor Society, and the American Marketing Association. He is a certified Project Management Professional (PMP)® through the Project Management Institute, credential issued March 2018 (credential ID 4220554). The journalism and advertising background shows up in his strength at clear, transparent communication with stakeholders.",
    tags: ["education", "pmp", "certification", "unt", "marketing"],
  },
  {
    id: "strengths",
    topic: "Working style & strengths",
    source: "Recommendations",
    content:
      "Colleagues describe Matt as someone who navigates large, complex enterprises with clarity and confidence and who understands how teams, processes, and priorities intersect. He is repeatedly praised for efficiency and organization — one colleague said every project with him was a complete success — and for leadership that makes people feel like a critical part of the team. His signature is transparent communication, measurable outcomes, and a get-it-done attitude.",
    tags: ["strengths", "leadership", "communication", "recommendations"],
  },
  {
    id: "contact",
    topic: "How to reach Matt",
    source: "Contact",
    content:
      "Matt is based in the Dallas–Fort Worth Metroplex and is open to AI-first product and product/program management opportunities. He can be reached by email at mattdenzin@yahoo.com or by phone at (972) 489-6324, and his LinkedIn profile is linkedin.com/in/matt-denzin-pmp-6b326110. Recruiters can also use the job-description fit analyzer on this site to see how his experience maps to a specific role.",
    tags: ["contact", "email", "phone", "linkedin", "location"],
  },
  {
    id: "ai-build",
    topic: "Hands-on AI product work",
    source: "AI & Product Innovation",
    content:
      "Beyond AI strategy, Matt has hands-on, shipped experience building with modern AI. He conceived, scoped, and shipped an AI-native product — this very website — including a retrieval-augmented-generation (RAG) career chatbot that answers questions grounded in his résumé with citations, and an LLM-powered job-description fit analyzer that returns a structured fit score, mapped strengths, and honest gaps. He designed the system and grounding prompts to prevent hallucination and resist prompt injection, built the embeddings and vector-search retrieval on Supabase pgvector, integrated the large language models through the Vercel AI SDK (Google Gemini), generated original brand imagery with a generative image model, and instrumented the product with a custom analytics pipeline (sessions, click heatmaps, bounce rate). He built it through AI-assisted (agentic) development while owning the product vision, scope, design direction, and iterative QA end to end — demonstrating he can not only manage AI products but ship one.",
    tags: [
      "ai",
      "rag",
      "llm",
      "prompt engineering",
      "embeddings",
      "ai-assisted development",
      "shipped product",
    ],
  },
  {
    id: "vehicle-pricing",
    topic: "Vehicle pricing, inventory feeds, OEM incentives & digital retailing",
    source: "Career highlight",
    content:
      "Dealer vehicle pricing has run through every role in Matt's career. He has worked closely with dealer DMS (dealer management system) feeds and OEM incentive feeds that drive the vehicle pricing displayed on dealer websites — so he understands first-hand how critical accurate, competitive pricing is to a dealer's competitiveness and inventory turn. During OEM website platform migrations he led a team that partnered directly with dealers to review and adjust their pricing displays and to stand up digital retailing products on the new sites. Most recently, in the Managed Services / local SEO service line at Cox Automotive, he led a vehicle-pricing initiative: he identified the requirements and re-engineered the dealer inventory data exports so accurate pricing flowed from the dealer feed to the DBA platform and on to Google, surfacing live dealer vehicle pricing on Google Vehicles for Sale. This is directly relevant to building an inventory-pricing product: he has owned the data feeds, the integrations, and the requirements that determine how a dealer's price reaches the consumer.",
    tags: [
      "vehicle pricing",
      "inventory feeds",
      "oem incentives",
      "incentive feeds",
      "dms",
      "dms integration",
      "digital retailing",
      "google vehicles for sale",
      "data feeds",
      "pricing",
    ],
  },
  {
    id: "scale-breadth",
    topic: "Scale and breadth of delivery",
    source: "Career highlight",
    content:
      "Matt has delivered at serious scale. He designed the processes and project-managed multiple cross-functional teams that implemented and launched over 5,000 websites. That work spanned fintech products and integrations; OEM integrations including incentives, DMS (dealer management system) integrations, and digital retailing; and the full range of digital marketing, including SEO. The throughline is repeatable, well-run process plus multi-team leadership that ships large volumes of integrated, revenue-generating web properties reliably.",
    tags: [
      "scale",
      "websites",
      "fintech",
      "dms integration",
      "digital retailing",
      "seo",
      "oem integrations",
      "process design",
      "team leadership",
    ],
  },
];

/** Starter questions shown as chips under the hero chat input. */
export const suggestedQuestions = [
  "What makes Matt a fit for an AI-first product role?",
  "Tell me about the product he owns at Cox Automotive.",
  "Has Matt led teams and managed budgets?",
  "Which automotive brands has he shipped programs for?",
  "What tools and methodologies does he use?",
  "What's his experience with vehicle pricing and inventory feeds?",
] as const;
