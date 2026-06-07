import { embed, embedMany, gateway } from "ai";
import { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from "./models";

const model = () => gateway.textEmbeddingModel(EMBEDDING_MODEL);

// Pin output dimensions so swapping the model can't silently break the
// pgvector(1536) column. (OpenAI text-embedding-3-* support `dimensions`.)
const providerOptions = {
  openai: { dimensions: EMBEDDING_DIMENSIONS },
} as const;

/** Embed a single string into a vector. */
export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: model(),
    value: text.replace(/\s+/g, " ").trim(),
    providerOptions,
  });
  return embedding;
}

/** Embed many strings in one batched request. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: model(),
    values: texts.map((t) => t.replace(/\s+/g, " ").trim()),
    providerOptions,
  });
  return embeddings;
}
