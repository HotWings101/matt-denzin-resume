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
  profile,
  competencies,
  experience,
  selectedProject,
  education,
  certifications,
} from "../src/data/resume";

const e = React.createElement;

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
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 9.3,
    lineHeight: 1.32,
    color: ink,
  },
  // Header
  name: { fontFamily: "Times-Roman", fontSize: 23, lineHeight: 1.1, color: ink, marginBottom: 2 },
  suffix: { fontFamily: "Times-Roman", fontSize: 12, color: accent },
  roles: { fontSize: 9.6, color: accent, marginTop: 3, letterSpacing: 0.4 },
  contact: { fontSize: 8.5, color: muted, marginTop: 5 },
  contactLink: { color: accent, textDecoration: "none" },
  sep: { color: border },
  rule: { borderBottomWidth: 1.5, borderBottomColor: accentDark, marginTop: 9, marginBottom: 2 },
  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.6,
    color: accent,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 5,
    borderBottomWidth: 0.8,
    borderBottomColor: border,
    paddingBottom: 3,
  },
  summary: { fontSize: 9.3, color: ink, marginTop: 1 },
  // Competencies
  compRow: { marginBottom: 2.3 },
  compLabel: { fontFamily: "Helvetica-Bold", color: ink },
  compItems: { color: muted },
  // Experience
  company: { marginTop: 7.5 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 10.6, color: ink },
  companyMeta: { fontSize: 8.4, color: muted, marginTop: 1 },
  posHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  posTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.7, color: accentDark },
  posDates: { fontSize: 8.4, color: muted },
  bulletRow: { flexDirection: "row", marginTop: 2.4, paddingLeft: 2 },
  bulletDot: { color: accent, marginRight: 6 },
  bulletText: { flex: 1, color: ink },
  // Education / cert two-col
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  eduLine: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: ink },
  eduMeta: { fontSize: 8.7, color: muted, marginTop: 1 },
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
    e(Text, { key: "loc" }, profile.location),
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
    ...experience.map((company) =>
      e(
        View,
        { key: company.name, style: s.company, wrap: false },
        e(Text, { style: s.companyName }, company.name),
        e(Text, { style: s.companyMeta }, `${company.location}  ·  ${company.context}`),
        ...company.positions.map((pos) =>
          e(
            View,
            { key: pos.title },
            e(
              View,
              { style: s.posHeader },
              e(Text, { style: s.posTitle }, pos.title),
              e(Text, { style: s.posDates }, `${pos.start} – ${pos.end}`),
            ),
            ...bulletsFor(pos).map((b, i) => e(Bullet, { key: i, text: b })),
          ),
        ),
      ),
    ),
  );
}

function SelectedProject() {
  const p = selectedProject;
  return e(
    View,
    { wrap: false },
    e(Text, { style: s.sectionTitle }, "Selected Project"),
    e(
      View,
      { style: s.posHeader },
      e(Text, { style: s.posTitle }, `${p.title} — ${SITE_LABEL}`),
      e(Text, { style: s.posDates }, p.timeframe),
    ),
    e(Text, { style: { ...s.companyMeta, marginTop: 1 } }, p.role),
    ...p.highlights.slice(0, 3).map((h, i) => e(Bullet, { key: i, text: h })),
    e(
      Text,
      { style: { ...s.companyMeta, marginTop: 3 } },
      e(Text, { style: { fontFamily: "Helvetica-Bold", color: ink } }, "Stack:  "),
      p.stack.join(" · "),
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
    title: `${profile.name} — Résumé`,
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
    e(SelectedProject),
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
