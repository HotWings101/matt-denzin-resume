import { getAdminClient } from "@/lib/supabase/admin";
import { embedText } from "./embeddings";

export interface RetrievedChunk {
  chunk_id: string;
  topic: string;
  source: string | null;
  content: string;
  similarity: number;
}

export interface Citation {
  topic: string;
  source: string | null;
}

/**
 * Embed the query and pull the most similar résumé chunks via pgvector.
 * Returns [] on any failure so the chat can degrade gracefully.
 */
export async function retrieveContext(
  query: string,
  matchCount = 6,
): Promise<RetrievedChunk[]> {
  try {
    const embedding = await embedText(query);
    const supabase = getAdminClient();
    const { data, error } = await supabase.rpc("match_resume_chunks", {
      query_embedding: embedding,
      match_count: matchCount,
      similarity_threshold: 0.2,
    });
    if (error) {
      console.error("[retrieval] rpc error:", error.message);
      return [];
    }
    return (data ?? []) as RetrievedChunk[];
  } catch (err) {
    console.error("[retrieval] failed:", err);
    return [];
  }
}

/** Format chunks into a context block for the system prompt. */
export function formatContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "(no matching context found)";
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.topic}${c.source ? ` — ${c.source}` : ""}\n${c.content}`,
    )
    .join("\n\n");
}

/** De-duplicated citations for the UI. */
export function toCitations(chunks: RetrievedChunk[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const c of chunks) {
    const key = `${c.topic}|${c.source ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ topic: c.topic, source: c.source });
  }
  return out;
}
