import { z } from "zod";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { recordEvent } from "@/lib/tracking";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("A valid email is required").max(200),
  message: z.string().trim().min(5, "Please add a short message").max(4000),
  visitorId: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = contactSchema.safeParse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, message, visitorId } = parsed.data;

  if (!isSupabaseConfigured()) {
    // Allow the form to "work" in local dev before provisioning.
    console.warn("[contact] Supabase not configured — message not stored:", {
      name,
      email,
    });
    return Response.json({ ok: true, stored: false });
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
      visitor_id: visitorId ?? null,
    });
    if (error) throw error;

    await recordEvent({
      type: "contact_submit",
      path: "/",
      visitorId,
      meta: { email },
      userAgent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
    });

    return Response.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[contact] insert failed:", err);
    return Response.json(
      { error: "Could not send your message. Please email Matt directly." },
      { status: 500 },
    );
  }
}
