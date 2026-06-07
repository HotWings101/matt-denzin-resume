import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./models";

/**
 * Embeddings via the Gemini API (gemini-embedding-001) called directly so we
 * can pin outputDimensionality to match the pgvector(1536) column. Cosine
 * similarity (used by match_resume_chunks) is scale-invariant, so the reduced,
 * un-normalized vectors are fine for ranking.
 */
function apiKey(): string {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");
  return key;
}

async function embedOne(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey()}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text: text.replace(/\s+/g, " ").trim() }] },
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Embedding request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;
  if (!Array.isArray(values)) throw new Error("No embedding values returned.");
  return values;
}

/** Embed a single string. */
export async function embedText(text: string): Promise<number[]> {
  return embedOne(text);
}

/** Embed many strings (sequential — used only by the one-off ingest script). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) out.push(await embedOne(t));
  return out;
}
