/**
 * Model configuration. All AI processing runs on Google Gemini via the
 * @ai-sdk/google provider, which reads GOOGLE_GENERATIVE_AI_API_KEY.
 */
export const CHAT_MODEL = process.env.CHAT_MODEL || "gemini-3.5-flash";
export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "gemini-embedding-001";

/** Output dimensionality for embeddings — must match the pgvector column. */
export const EMBEDDING_DIMENSIONS = 1536;
