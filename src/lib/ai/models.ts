/**
 * Model configuration. Models are addressed as "provider/model" strings and
 * routed through the Vercel AI Gateway (unified billing + fallback).
 */
export const CHAT_MODEL = process.env.CHAT_MODEL || "anthropic/claude-sonnet-4-6";
export const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "openai/text-embedding-3-small";

/** Dimensions for text-embedding-3-small — must match the pgvector column. */
export const EMBEDDING_DIMENSIONS = 1536;
