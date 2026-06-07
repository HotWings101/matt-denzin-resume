import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Guards /admin and refreshes the auth session. The public site never calls
 * Supabase Auth (no per-request round-trip, and an Auth outage can't 500 the
 * homepage). Fails CLOSED: any error or an empty allowlist denies access.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith("/admin");
  const isLogin = path === "/admin/login";

  // Only the admin area needs an auth check.
  if (!isAdminArea || isLogin) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  let email: string | undefined;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email?.toLowerCase();
  } catch (err) {
    // Network/Auth failure → fail closed (redirect to login below).
    console.error("[middleware] auth check failed:", err);
  }

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Empty allowlist = deny everyone (NOT allow-all).
  const allowed = !!email && allow.length > 0 && allow.includes(email);

  if (!allowed) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
