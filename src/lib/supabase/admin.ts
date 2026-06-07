import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { WebSocket as WS } from "ws";

/**
 * Service-role Supabase client. SERVER-ONLY — bypasses RLS.
 * Never import this into a client component; the service key is not public.
 */
let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    // supabase-js realtime needs a global WebSocket; Node < 22 lacks one.
    // Vercel runs Node 22+, so this transport is a harmless local-dev shim.
    realtime: { transport: WS as unknown as typeof WebSocket },
  });
  return cached;
}

/** True when server-side Supabase access is configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
