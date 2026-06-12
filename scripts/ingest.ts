/**
 * Ingest Matt's career into the `resume_chunks` table as embeddings.
 *
 * Usage:  npm run ingest        (requires .env.local with Supabase + AI Gateway)
 *
 * Idempotent: upserts by stable `chunk_id`, so re-running refreshes embeddings.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { knowledge } from "../src/data/knowledge";
import {
  experience,
  competencies,
  education,
  certifications,
  recommendations,
  profile,
} from "../src/data/resume";
import { embedTexts } from "../src/lib/ai/embeddings";
import { EMBEDDING_DIMENSIONS } from "../src/lib/ai/models";
import { getAdminClient } from "../src/lib/supabase/admin";

interface Chunk {
  chunk_id: string;
  topic: string;
  source: string | null;
  content: string;
  tags: string[];
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  // 1) Curated knowledge passages
  for (const k of knowledge) {
    chunks.push({
      chunk_id: `kb_${k.id}`,
      topic: k.topic,
      source: k.source ?? null,
      content: k.content,
      tags: k.tags,
    });
  }

  // 2) One passage per role (finer-grained retrieval)
  for (const company of experience) {
    for (const pos of company.positions) {
      chunks.push({
        chunk_id: `role_${slug(company.name)}_${slug(pos.title)}`,
        topic: `${pos.title} at ${company.name}`,
        source: `${company.name} · ${pos.start}–${pos.end}`,
        content: `${pos.title} at ${company.name} (${pos.start}–${pos.end}).${pos.summary ? ` ${pos.summary}` : ""}${pos.result ? ` Key result: ${pos.result}` : ""} ${pos.highlights.join(" ")}`,
        tags: pos.skills ?? [],
      });
    }
  }

  // 3) Skills & competencies
  chunks.push({
    chunk_id: "skills",
    topic: "Skills & competencies",
    source: "Core competencies",
    content: competencies
      .map((g) => `${g.label}: ${g.items.join(", ")}.`)
      .join(" "),
    tags: ["skills", "tools", "competencies"],
  });

  // 4) Education & certifications
  chunks.push({
    chunk_id: "education",
    topic: "Education & certifications",
    source: "Education",
    content: [
      ...education.map(
        (e) =>
          `${e.credential} — ${e.detail}, ${e.school} (${e.years}).${
            e.activities ? ` Activities: ${e.activities.join(", ")}.` : ""
          }`,
      ),
      ...certifications.map(
        (c) =>
          `${c.name}, ${c.issuer}, issued ${c.issued}${
            c.credentialId ? ` (credential ID ${c.credentialId})` : ""
          }.`,
      ),
    ].join(" "),
    tags: ["education", "certification", "pmp"],
  });

  // 5) Recommendations
  chunks.push({
    chunk_id: "recommendations",
    topic: "Recommendations",
    source: "Recommendations",
    content: recommendations
      .map((r) => `"${r.quote}" — ${r.name}, ${r.role}.`)
      .join(" "),
    tags: ["recommendations", "leadership", "strengths"],
  });

  return chunks;
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL — set up .env.local first.");
  }
  console.log(`Ingesting career for ${profile.name}…`);

  const chunks = buildChunks();
  console.log(`Built ${chunks.length} chunks. Generating embeddings…`);

  // Embed content only (topic is kept as a separate column for citations) so
  // document vectors stay symmetric with raw natural-language query vectors.
  const embeddings = await embedTexts(chunks.map((c) => c.content));

  if (embeddings.some((e) => e.length !== EMBEDDING_DIMENSIONS)) {
    throw new Error(
      `Embedding dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${embeddings[0]?.length}. Check EMBEDDING_MODEL.`,
    );
  }

  const rows = chunks.map((c, i) => ({
    chunk_id: c.chunk_id,
    topic: c.topic,
    source: c.source,
    content: c.content,
    tags: c.tags,
    embedding: embeddings[i],
    updated_at: new Date().toISOString(),
  }));

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("resume_chunks")
    .upsert(rows, { onConflict: "chunk_id" });

  if (error) {
    console.error("Upsert failed:", error);
    process.exit(1);
  }

  console.log(`✓ Ingested ${rows.length} chunks into resume_chunks.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
