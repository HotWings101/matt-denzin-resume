/**
 * Generate a 2-page PDF résumé from the structured career data in resume.ts.
 *
 * Usage:  npm run resume   →   writes public/Matthew-Denzin-Resume.pdf
 *
 * Single source of truth: edit src/data/resume.ts, re-run this, and the PDF
 * stays in sync with the website. Built with @react-pdf/renderer (pure Node,
 * real selectable text → ATS-friendly). Palette matches the warm clay branding.
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  renderToFile,
} from "@react-pdf/renderer";
import type { Position } from "../src/data/resume";
import {
  profile as rawProfile,
  competencies as rawCompetencies,
  experience as rawExperience,
  education as rawEducation,
  certifications as rawCertifications,
} from "../src/data/resume";

// ATS hardening: normalize "smart" punctuation to plain ASCII in the PDF so
// every parser (and plain-text copy/paste) reads dashes, quotes, and ranges
// correctly. The website keeps its real typography — this only affects the PDF.
const SMART: [RegExp, string][] = [
  [/[–—]/g, "-"], // en/em dash → hyphen
  [/[‘’‚′]/g, "'"], // curly single quotes / prime → '
  [/[“”„″]/g, '"'], // curly double quotes → "
  [/…/g, "..."], // ellipsis → ...
  [/ /g, " "], // non-breaking space → space
];
function ascii(str: string): string {
  return SMART.reduce((out, [re, rep]) => out.replace(re, rep), str);
}

/** Recursively ASCII-normalize every string in the structured résumé data so
 *  the PDF never emits smart punctuation. The website data stays untouched. */
function deepAscii<T>(value: T): T {
  if (typeof value === "string") return ascii(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepAscii(v)) as unknown as T;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepAscii(v);
    return out as T;
  }
  return value;
}

const e = React.createElement;

// ASCII-normalized copies used only for the PDF.
const profile = deepAscii(rawProfile);
const competencies = deepAscii(rawCompetencies);
const experience = deepAscii(rawExperience);
const education = deepAscii(rawEducation);
const certifications = deepAscii(rawCertifications);

// Spacing knobs — tuned so the content fills exactly two full pages (the next
// increment overflows onto a third). Override via RESUME_SP / RESUME_LH to retune
// if the résumé content changes materially.
const SP = Number(process.env.RESUME_SP) || 0.95;
const LH = Number(process.env.RESUME_LH) || 1.32;
// Global font scale. Bumped above 1 so the résumé reads less condensed and the
// content fills two full pages rather than trailing off mid-page-two.
const FS = Number(process.env.RESUME_FS) || 1.06;

const SITE_URL = "https://matthewdenzin.ai";
const SITE_LABEL = "matthewdenzin.ai";

// Max bullets shown per role on the PDF (result + highlights). Full detail
// lives on the site. Tuned to fill two full pages.
const MAX_BULLETS = 5;
// A highlight whose significant words overlap the result above this fraction is
// dropped as redundant (the reframed lead highlights restate the result).
const REDUNDANCY_THRESHOLD = 0.5;

// Warm clay branding (extracted from the reference résumé).
const ink = "#2a2118";
const muted = "#7a6c58";
const accent = "#b5532a";
const accentDark = "#8a3c1c";
const border = "#ddcfb8";

const s = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 38,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
    fontSize: 9.4 * FS,
    lineHeight: LH,
    color: ink,
  },
  // Header
  name: { fontFamily: "Times-Roman", fontSize: 23 * FS, lineHeight: 1.1, color: ink, marginBottom: 2 },
  suffix: { fontFamily: "Times-Roman", fontSize: 12 * FS, color: accent },
  roles: { fontSize: 9.6 * FS, color: accent, marginTop: 3, letterSpacing: 0.4 },
  contact: { fontSize: 8.5 * FS, color: muted, marginTop: 5 },
  contactLink: { color: accent, textDecoration: "none" },
  sep: { color: border },
  rule: { borderBottomWidth: 1.5, borderBottomColor: accentDark, marginTop: 9, marginBottom: 2 },
  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.6 * FS,
    color: accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 11 * SP,
    marginBottom: 5 * SP,
    borderBottomWidth: 0.8,
    borderBottomColor: border,
    paddingBottom: 3.5,
  },
  summary: { fontSize: 9.3 * FS, color: ink, marginTop: 1 },
  // Competencies
  compRow: { marginBottom: 2.7 * SP },
  compLabel: { fontFamily: "Helvetica-Bold", color: ink },
  compItems: { color: muted },
  // Experience
  company: { marginTop: 8.5 * SP },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 10.6 * FS, color: ink },
  companyMeta: { fontSize: 8.4 * FS, color: muted, marginTop: 1.5 },
  posHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5.5 * SP,
  },
  posTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.7 * FS, color: accentDark },
  posDates: { fontSize: 8.4 * FS, color: muted },
  bulletRow: { flexDirection: "row", marginTop: 2.9 * SP, paddingLeft: 2 },
  bulletDot: { color: accent, marginRight: 6 },
  bulletText: { flex: 1, color: ink },
  // Education / cert two-col
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  eduLine: { fontFamily: "Helvetica-Bold", fontSize: 9.5 * FS, color: ink },
  eduMeta: { fontSize: 8.7 * FS, color: muted, marginTop: 1 },
});

/** Significant (length > 3) lowercased word set, for redundancy comparison. */
function sigWords(str: string): Set<string> {
  return new Set((str.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 3));
}

/** result (as a plain bullet) + highlights, dropping any that restate the result. */
function bulletsFor(pos: Position): string[] {
  const out: string[] = [];
  if (pos.result) out.push(pos.result);
  const resultWords = pos.result ? sigWords(pos.result) : new Set<string>();
  for (const h of pos.highlights) {
    if (out.length >= MAX_BULLETS) break;
    const hw = [...sigWords(h)];
    const overlap = hw.length ? hw.filter((w) => resultWords.has(w)).length / hw.length : 0;
    if (overlap < REDUNDANCY_THRESHOLD) out.push(h);
  }
  return out;
}

function Bullet({ text }: { text: string }) {
  return e(
    View,
    { style: s.bulletRow },
    e(Text, { style: s.bulletDot }, "›"),
    e(Text, { style: s.bulletText }, text),
  );
}

function Header() {
  const contactBits = [
    e(Text, { key: "loc" }, "Dallas-Fort Worth, TX"),
    e(Text, { key: "s1", style: s.sep }, "   ·   "),
    e(Link, { key: "tel", style: s.contactLink, src: `tel:${profile.phone.replace(/[^0-9+]/g, "")}` }, profile.phone),
    e(Text, { key: "s2", style: s.sep }, "   ·   "),
    e(Link, { key: "mail", style: s.contactLink, src: `mailto:${profile.email}` }, profile.email),
    e(Text, { key: "s3", style: s.sep }, "   ·   "),
    e(Link, { key: "li", style: s.contactLink, src: profile.linkedin }, profile.linkedinLabel),
    e(Text, { key: "s4", style: s.sep }, "   ·   "),
    e(Link, { key: "site", style: s.contactLink, src: SITE_URL }, SITE_LABEL),
  ];

  return e(
    View,
    null,
    e(
      Text,
      { style: s.name },
      profile.name,
      e(Text, { style: s.suffix }, `   ${profile.suffix}`),
    ),
    e(Text, { style: s.roles }, profile.roles.join("   ·   ")),
    e(Text, { style: s.contact }, ...contactBits),
    e(View, { style: s.rule }),
  );
}

function Competencies() {
  return e(
    View,
    { wrap: false },
    e(Text, { style: s.sectionTitle }, "Core Competencies"),
    ...competencies.map((g) =>
      e(
        Text,
        { key: g.label, style: s.compRow },
        e(Text, { style: s.compLabel }, `${g.label}:  `),
        e(Text, { style: s.compItems }, g.items.join(" · ")),
      ),
    ),
  );
}

function Experience() {
  return e(
    View,
    null,
    e(Text, { style: s.sectionTitle }, "Experience"),
    // Companies may break *between* positions across the page boundary (so the
    // content flows and fills both pages), but each individual position is kept
    // intact (wrap:false) and the company header is kept with its first role.
    ...experience.map((company) =>
      e(
        View,
        { key: company.name, style: s.company },
        e(Text, { style: s.companyName, minPresenceAhead: 60 }, company.name),
        e(Text, { style: s.companyMeta }, `${company.location}  ·  ${company.context}`),
        ...company.positions.map((pos) =>
          e(
            View,
            { key: pos.title, wrap: false },
            e(
              View,
              { style: s.posHeader },
              e(Text, { style: s.posTitle }, pos.title),
              e(Text, { style: s.posDates }, `${pos.start} - ${pos.end}`),
            ),
            ...bulletsFor(pos).map((b, i) => e(Bullet, { key: i, text: b })),
          ),
        ),
      ),
    ),
  );
}

function EducationCert() {
  return e(
    View,
    { wrap: false },
    e(Text, { style: s.sectionTitle }, "Education & Certification"),
    e(
      View,
      { style: s.twoCol },
      e(
        View,
        { style: s.col },
        ...education.map((ed) =>
          e(
            View,
            { key: ed.school },
            e(Text, { style: s.eduLine }, ed.detail),
            e(Text, { style: s.eduMeta }, `${ed.school} · ${ed.years}`),
          ),
        ),
      ),
      e(
        View,
        { style: s.col },
        ...certifications.map((c) =>
          e(
            View,
            { key: c.name },
            e(Text, { style: s.eduLine }, c.name),
            e(
              Text,
              { style: s.eduMeta },
              `${c.issuer} · Issued ${c.issued}${c.credentialId ? ` · ID ${c.credentialId}` : ""}`,
            ),
          ),
        ),
      ),
    ),
  );
}

const Resume = e(
  Document,
  {
    title: `${profile.name} - Résumé`,
    author: profile.name,
    subject: profile.tagline,
    creator: SITE_LABEL,
  },
  e(
    Page,
    { size: "LETTER", style: s.page },
    e(Header),
    e(
      View,
      null,
      e(Text, { style: s.sectionTitle }, "Summary"),
      e(Text, { style: s.summary }, profile.summary),
    ),
    e(Competencies),
    e(Experience),
    e(EducationCert),
  ),
);

async function main() {
  const out = "public/Matthew-Denzin-Resume.pdf";
  await renderToFile(Resume, out);
  console.log(`✓ Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
