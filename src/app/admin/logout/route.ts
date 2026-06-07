import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[logout] failed:", err);
  }
  return NextResponse.redirect(new URL("/admin/login", req.url), {
    status: 303,
  });
}
