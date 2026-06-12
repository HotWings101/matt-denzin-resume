/**
 * Generate a 2-page PDF résumé from the structured career data in resume.ts.
 *
 * Usage:  npm run resume   →   writes public/Matthew-Denzin-Resume.pdf
 *
 * Single source of truth: edit src/data/resume.ts, re-run this, and the PDF
 * stays in sync with the website. Built with @react-pdf/renderer (pure Node,
 * real selectable text → ATS-friendly).
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
import {
  profile,
  competencies,
  experience,
  education,
  certifications,
} from "../src/data/resume";

const e = React.createElement;

const SITE_URL = "https://matthewdenzin.ai";
const SITE_LABEL = "matthewdenzin.ai";

// Top highlights shown per role on the PDF (full detail lives on the site).
const PDF_HIGHLIGHTS = 3;

const ink = "#1b1813";
const muted = "#5c5648";
const accent = "#4f46e5";
const clay = "#a8481a";
const border = "#e0dbcd";

const s = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 34,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 9.3,
    lineHeight: 1.4,
    color: ink,
  },
  // Header
  name: { fontFamily: "Times-Roman", fontSize: 23, lineHeight: 1.1, color: ink, marginBottom: 2 },
  suffix: { fontFamily: "Times-Roman", fontSize: 12, color: accent },
  roles: { fontSize: 9.5, color: accent, marginTop: 3, letterSpacing: 0.3 },
  contact: { fontSize: 8.6, color: muted, marginTop: 5 },
  contactLink: { color: accent, textDecoration: "none" },
  sep: { color: border },
  rule: { borderBottomWidth: 1.4, borderBottomColor: accent, marginTop: 9, marginBottom: 2 },
  // Sections
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: accent,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: border,
    paddingBottom: 3,
  },
  summary: { fontSize: 9.3, color: ink, marginTop: 1 },
  // Competencies
  compRow: { marginBottom: 2.5 },
  compLabel: { fontFamily: "Helvetica-Bold", color: ink },
  compItems: { color: muted },
  // Experience
  company: { marginTop: 9 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: ink },
  companyMeta: { fontSize: 8.4, color: muted, marginTop: 1 },
  posHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  posTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.6, color: ink },
  posDates: { fontSize: 8.4, color: muted },
  result: {
    flexDirection: "row",
    marginTop: 3,
    marginBottom: 1,
  },
  resultLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.6,
    color: accent,
    letterSpacing: 0.6,
    marginRight: 5,
    marginTop: 1.4,
  },
  resultText: { flex: 1, fontFamily: "Helvetica-Oblique", fontSize: 9.2, color: ink },
  bulletRow: { flexDirection: "row", marginTop: 2.5, paddingLeft: 2 },
  bulletDot: { color: accent, marginRight: 5 },
  bulletText: { flex: 1, color: ink },
  // Education / cert two-col
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  eduLine: { fontFamily: "Helvetica-Bold", fontSize: 9.4, color: ink },
  eduMeta: { fontSize: 8.7, color: muted, marginTop: 1 },
});

function Bullet({ text }: { text: string }) {
  return e(
    View,
    { style: s.bulletRow },
    e(Text, { style: s.bulletDot }, "›"),
    e(Text, { style: s.bulletText }, text),
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return e(View, { wrap: false }, e(Text, { style: s.sectionTitle }, title), children);
}

function Header() {
  const contactBits = [
    e(Text, { key: "loc" }, profile.location),
    e(Text, { key: "s1", style: s.sep }, "  ·  "),
    e(Link, { key: "tel", style: s.contactLink, src: `tel:${profile.phone.replace(/[^0-9+]/g, "")}` }, profile.phone),
    e(Text, { key: "s2", style: s.sep }, "  ·  "),
    e(Link, { key: "mail", style: s.contactLink, src: `mailto:${profile.email}` }, profile.email),
    e(Text, { key: "s3", style: s.sep }, "  ·  "),
    e(Link, { key: "li", style: s.contactLink, src: profile.linkedin }, profile.linkedinLabel),
    e(Text, { key: "s4", style: s.sep }, "  ·  "),
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
    Section,
    { title: "Core Competencies" },
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
            pos.result
              ? e(
                  View,
                  { style: s.result },
                  e(Text, { style: s.resultLabel }, "RESULT"),
                  e(Text, { style: s.resultText }, pos.result),
                )
              : null,
            ...pos.highlights
              .slice(0, PDF_HIGHLIGHTS)
              .map((h, i) => e(Bullet, { key: i, text: h })),
          ),
        ),
      ),
    ),
  );
}

function EducationCert() {
  return e(
    Section,
    { title: "Education & Certification" },
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
