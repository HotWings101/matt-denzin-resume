import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { WebSocket as WS } from "ws";

/**
 * Cookie-bound Supabase client for Server Components / Route Handlers.
 * Used for admin Auth (the anon key only). Reads the session from cookies.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: { transport: WS as unknown as typeof WebSocket },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — safe to ignore, middleware refreshes.
          }
        },
      },
    },
  );
}
