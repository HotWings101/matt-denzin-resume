/**
 * Single source of truth for Matt Denzin's career.
 *
 * This structured data drives BOTH the rendered UI and the AI knowledge base
 * (see `scripts/ingest.ts`, which derives retrieval chunks from this file plus
 * the curated passages in `src/data/knowledge.ts`).
 *
 * Everything here is faithful to the source résumé — no fabricated metrics.
 */

export interface Position {
  title: string;
  start: string; // e.g. "May 2021"
  end: string; // e.g. "Present"
  current?: boolean;
  summary: string;
  highlights: string[];
  skills?: string[];
}

export interface Company {
  name: string;
  location: string;
  /** Short descriptor of the company for context. */
  context: string;
  /** Path to the company logo in /public. */
  logo?: string;
  positions: Position[];
}

export interface SkillGroup {
  label: string;
  items: string[];
  /** Custom icon (in /public/icons) for the capability card. */
  icon?: string;
}

export interface Education {
  school: string;
  detail: string;
  credential: string;
  years: string;
  activities?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  credentialId?: string;
}

export interface Recommendation {
  quote: string;
  name: string;
  role: string;
}

export const profile = {
  name: "Matthew Denzin",
  shortName: "Matt Denzin",
  suffix: "PMP",
  roles: ["Product Manager", "Technical Project Manager", "Operations Leader"],
  /** One-line positioning used in the hero and meta tags. */
  tagline:
    "Product & operations leader turning complex, multi-brand technology programs into shipped, measurable outcomes.",
  /** Two-sentence elevator pitch tuned toward AI-first PM/Product roles. */
  pitch:
    "I'm a PMP-certified product and operations leader with 15+ years delivering enterprise web platforms, OEM digital programs, and workflow-automation products across the automotive ecosystem. I lead with discovery, ship with measurable KPIs, and I build the systems — increasingly AI-powered — that let teams move faster with less friction.",
  location: "Dallas–Fort Worth Metroplex",
  email: "mattdenzin@yahoo.com",
  phone: "(972) 489-6324",
  linkedin: "https://www.linkedin.com/in/matt-denzin-pmp-6b326110",
  linkedinLabel: "linkedin.com/in/matt-denzin-pmp",
  summary:
    "Product-focused Operations Manager and PMP-certified leader with 15+ years delivering enterprise web platforms, OEM digital programs, and cross-functional technology initiatives. Deep experience in Agile product delivery, sprint planning, backlog refinement, product roadmapping, UAT/QA oversight, and release management. Proven ability to lead engineering, product, design, and operations teams across complex, multi-brand automotive ecosystems. Known for transparent communication, measurable outcomes, and a “get it done” leadership style.",
} as const;

export const competencies: SkillGroup[] = [
  {
    label: "AI & Product Innovation",
    icon: "/icons/cap-ai-innovation.jpg",
    items: [
      "AI Product Strategy",
      "LLM Application Design",
      "Retrieval-Augmented Generation (RAG)",
      "Prompt Engineering",
      "Vector Search & Embeddings",
      "AI-Assisted Development",
      "Rapid Prototyping & Shipping",
    ],
  },
  {
    label: "Product Management",
    icon: "/icons/cap-product-management.jpg",
    items: [
      "Roadmapping",
      "Backlog Prioritization",
      "Sprint Planning",
      "User Stories",
      "Acceptance Criteria",
    ],
  },
  {
    label: "Project / Program Leadership",
    icon: "/icons/cap-program-leadership.jpg",
    items: [
      "Scope / Schedule / Budget Control",
      "RAID Management",
      "PMO Governance",
      "Work Breakdown Structures",
    ],
  },
  {
    label: "Technical Delivery",
    icon: "/icons/cap-technical-delivery.jpg",
    items: [
      "Website Platforms",
      "Digital Retailing",
      "Workflow Automation",
      "API / Integrations",
    ],
  },
  {
    label: "Operations",
    icon: "/icons/cap-operations.jpg",
    items: [
      "KPI Development",
      "Forecasting",
      "Process Optimization",
      "Cross-Functional Alignment",
    ],
  },
  {
    label: "Methodologies",
    icon: "/icons/cap-methodologies.jpg",
    items: ["Agile", "Scrum", "Kanban", "Waterfall", "Hybrid"],
  },
  {
    label: "Tools & Platforms",
    icon: "/icons/cap-tools-platforms.jpg",
    items: [
      "Salesforce Lightning",
      "Smartsheet",
      "Jira",
      "Confluence",
      "Azure DevOps",
      "Power BI",
      "Power Platform",
      "HTML / CSS / JS",
      "Next.js",
      "Vercel AI SDK",
      "Supabase / pgvector",
      "Google Gemini",
    ],
  },
];

export const experience: Company[] = [
  {
    name: "Cox Automotive Inc.",
    logo: "/logos/employers/cox.svg",
    location: "Dallas–Fort Worth Metroplex",
    context:
      "One of the world's largest automotive technology and services companies, home to Autotrader, Kelley Blue Book, Dealer.com, and HomeNet.",
    positions: [
      {
        title: "Product Operations Manager – Managed Services",
        start: "May 2021",
        end: "Present",
        current: true,
        summary:
          "Product Manager for WOMS (Work Operations Management System), an enterprise Power Platform product, owning the full product lifecycle from vision and roadmap through release and adoption.",
        highlights: [
          "Serve as Product Manager for WOMS, owning the full product lifecycle from vision and roadmap through release and adoption across multiple business units.",
          "Lead customer discovery through user interviews, workflow analysis, and cross-business-unit sessions to identify unmet needs, validate assumptions, and prioritize high-impact product opportunities.",
          "Translate stakeholder input into structured product requirements — epics, features, user stories, and acceptance criteria — serving as the bridge between business teams and engineering.",
          "Own sprint planning, backlog refinement, and iteration structuring, maintaining a sequenced backlog aligned to roadmap milestones and release targets.",
          "Design and execute QA test scenarios; lead UAT cycles, coordinate tester assignments, capture defects, and validate release readiness before production deployment.",
          "Build KPI frameworks tracking cycle time, rework volume, and throughput; use performance data to drive roadmap prioritization and continuous product improvement.",
          "Standardized onboarding, training, and adoption workflows across SEO, HomeNet, AMP, and Autotrader business units, driving consistent platform engagement across the organization.",
          "Leverage Power Platform (Model-Driven Apps, Dataverse, Power Automate) and Salesforce Lightning to automate workflows, reduce manual effort, and increase operational throughput.",
        ],
        skills: [
          "Product Management",
          "Power Platform",
          "Dataverse",
          "Power Automate",
          "Salesforce Lightning",
          "Discovery",
          "KPI Frameworks",
          "UAT / QA",
        ],
      },
      {
        title: "Sr. Technical Project Manager – OEM",
        start: "Mar 2017",
        end: "May 2021",
        summary:
          "Led enterprise OEM website programs across multiple global automotive brands, managing the full lifecycle for platform upgrades, rebranding, and workflow automation.",
        highlights: [
          "Led enterprise OEM website programs across multiple global automotive brands, including Audi, Ford, Lincoln, Genesis, Hyundai, Toyota, Lexus, and Honda.",
          "Managed the full project lifecycle for platform upgrades, rebranding, product add-ons, and workflow automation.",
          "Controlled scope, schedule, and budget while developing WBS, baselines, risk strategies, and technical implementation plans.",
          "Forecasted implementation output, team capacity, and KPI performance to support portfolio-level planning.",
          "Delivered consistent stakeholder communication through work performance reports, stand-ups, portfolio reviews, and automated reporting.",
          "Contributed to PMO governance by standardizing processes, templates, and lessons-learned to reduce future project costs.",
        ],
        skills: [
          "Program Management",
          "OEM Platforms",
          "Scope / Schedule / Budget",
          "WBS & Baselines",
          "Risk Management",
          "PMO Governance",
        ],
      },
    ],
  },
  {
    name: "Dealertrack / Dealer.com",
    logo: "/logos/employers/dealertrack.png",
    location: "Dallas–Fort Worth Metroplex",
    context:
      "Leading provider of dealership websites, digital marketing, and DMS software (now part of Cox Automotive).",
    positions: [
      {
        title: "Sr. Production Project Manager",
        start: "Nov 2014",
        end: "Feb 2017",
        summary:
          "Led a team of Implementation Project Managers delivering Ford Motor Company websites, owning production workflow and on-time delivery.",
        highlights: [
          "Led a team of Implementation Project Managers delivering Ford Motor Company websites.",
          "Managed production workflow, delegated builds, and ensured on-time delivery of high-quality sites.",
          "Forecasted output, set monthly team goals, and tracked KPIs for leadership reporting.",
          "Resolved escalations, removed bottlenecks, improved processes, and facilitated daily Scrum and cross-team communication.",
        ],
        skills: [
          "Team Leadership",
          "Production Management",
          "Forecasting",
          "KPIs",
          "Scrum Facilitation",
        ],
      },
      {
        title: "Sr. Branding Specialist",
        start: "May 2012",
        end: "Nov 2014",
        summary:
          "Directed creative and technical onboarding for new dealership clients, from branding strategy through hands-on implementation.",
        highlights: [
          "Directed creative and technical onboarding for new dealership clients; developed branding strategies, creative briefs, and website mockups.",
          "Managed revisions, asset collection, deadlines, and cross-department coordination.",
          "Performed QA, proofreading, and content validation; implemented assets using HTML, CSS, and JavaScript.",
          "Advised clients on SEO/SEM opportunities and ensured compliance with Ford/Lincoln brand standards.",
        ],
        skills: [
          "Branding Strategy",
          "Creative Direction",
          "HTML / CSS / JS",
          "QA",
          "SEO / SEM",
        ],
      },
    ],
  },
  {
    name: "ClickMotive",
    logo: "/logos/employers/clickmotive.png",
    location: "Dallas–Fort Worth Metroplex",
    context:
      "Automotive digital marketing and website platform provider serving OEM dealer programs.",
    positions: [
      {
        title: "Digital Advisor / Account Executive",
        start: "May 2010",
        end: "May 2012",
        summary:
          "Supported 250+ Toyota dealership websites under the Enterprise Toyota GSM Program, leading escalation, training, and release coordination.",
        highlights: [
          "Supported 250+ Toyota dealership websites under the Enterprise Toyota GSM Program.",
          "Led daily escalation and training calls with GSM support teams; conducted monthly performance reviews with MAG/VIP dealers.",
          "Coordinated platform releases, bug prioritization, and escalations with Dev/Engineering.",
          "Trained and onboarded new hires on platform functionality and support processes.",
        ],
        skills: [
          "Account Management",
          "Escalation Management",
          "Release Coordination",
          "Training & Onboarding",
        ],
      },
    ],
  },
];

export interface Project {
  title: string;
  timeframe: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  links: { label: string; href: string }[];
}

/** Featured self-directed project — this AI-native site itself. */
export const selectedProject: Project = {
  title: "AI-First Portfolio Platform",
  timeframe: "2026 · Self-directed",
  role: "Product & build · AI-assisted development",
  summary:
    "Conceived, scoped, and shipped this very website — an AI-native, fully instrumented résumé product — owning the vision, feature scope, prompt and grounding design, QA, and deployment.",
  highlights: [
    "Retrieval-augmented (RAG) career chat that answers questions grounded in the résumé, with source citations.",
    "LLM-powered job-description fit analyzer returning a structured fit score, mapped strengths, and honest gaps.",
    "Custom product-analytics pipeline — sessions, click heatmaps, bounce rate, and a per-visitor journey dashboard.",
    "System and grounding prompts designed to prevent hallucination and resist prompt injection.",
  ],
  stack: [
    "Next.js",
    "TypeScript",
    "Google Gemini",
    "Vercel AI SDK",
    "Supabase",
    "pgvector",
    "Tailwind CSS",
  ],
  links: [
    { label: "Try the career chat", href: "#ask" },
    { label: "Try the JD-fit analyzer", href: "#jd-fit" },
  ],
};

export const education: Education[] = [
  {
    school: "University of North Texas — Mayborn School of Journalism",
    detail: "B.A., Advertising (Minor: Marketing)",
    credential: "Bachelor of Arts",
    years: "2004–2008",
    activities: [
      "Advertising Club",
      "Tau Sigma Honor Society",
      "American Marketing Association",
    ],
  },
];

export const certifications: Certification[] = [
  {
    name: "Project Management Professional (PMP)®",
    issuer: "Project Management Institute",
    issued: "Mar 2018",
    credentialId: "4220554",
  },
];

export const recommendations: Recommendation[] = [
  {
    quote:
      "Matt has a rare ability to navigate a large, complex enterprise with clarity and confidence. His understanding of how teams, processes, and priorities intersect is truly unparalleled.",
    name: "Adam Wehmeyer",
    role: "OEM Program Manager, Dealer.com",
  },
  {
    quote:
      "There is no better person when it comes to efficiency and organization. Every time I was on a project with him, I knew it would be a complete success.",
    name: "Lauren Partin",
    role: "Project & Brand Management",
  },
  {
    quote:
      "His leadership skills are outstanding. He made coming to work a positive experience where everyone felt like a critical component in the team's success.",
    name: "Guillermo Rendon",
    role: "Software Developer",
  },
];

/** Brands Matt has shipped programs for — used as a logo/marquee strip. */
export const brands = [
  "Audi",
  "Ford",
  "Lincoln",
  "Genesis",
  "Hyundai",
  "Toyota",
  "Lexus",
  "Honda",
] as const;

/** Self-hosted brand logos (SVG, in /public/logos) for the "shipped for" strip. */
export const brandLogos = [
  { name: "Audi", src: "/logos/audi.svg" },
  { name: "Ford", src: "/logos/ford.svg" },
  { name: "Lincoln", src: "/logos/lincoln.svg" },
  { name: "Genesis", src: "/logos/genesis.svg" },
  { name: "Hyundai", src: "/logos/hyundai.svg" },
  { name: "Toyota", src: "/logos/toyota.svg" },
  { name: "Lexus", src: "/logos/lexus.svg" },
  { name: "Honda", src: "/logos/honda.svg" },
] as const;

/** High-level facts surfaced as a stat strip. */
export const stats = [
  { value: "15+", label: "Years in product & delivery" },
  { value: "8", label: "Global OEM brands shipped" },
  { value: "250+", label: "Dealer sites supported" },
  { value: "PMP", label: "Certified since 2018" },
] as const;
