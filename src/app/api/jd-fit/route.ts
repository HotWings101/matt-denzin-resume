import { generateObject, gateway } from "ai";
import { z } from "zod";
import { CHAT_MODEL } from "@/lib/ai/models";
import { jdFitSystemPrompt } from "@/lib/ai/prompts";
import { fullCareerContext } from "@/lib/ai/context";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { recordEvent } from "@/lib/tracking";

export const maxDuration = 45;

const fitSchema = z.object({
  role_title: z.string().nullable().describe("The job title from the JD, or null."),
  company: z.string().nullable().describe("The hiring company from the JD, or null."),
  fit_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Holistic 0-100 match of Matt to this specific role."),
  summary: z.string().describe("2-3 sentence verdict for a hiring manager."),
  strengths: z
    .array(
      z.object({
        requirement: z.string().describe("A requirement from the JD."),
        evidence: z
          .string()
          .describe("Specific evidence from Matt's record that matches it."),
      }),
    )
    .describe("Concrete matches between the role and Matt's experience."),
  gaps: z
    .array(z.string())
    .describe("Requirements Matt's record does not clearly demonstrate."),
  pitch: z
    .string()
    .describe("A short first-person paragraph (as Matt) for this role."),
});

export type JdFitResult = z.infer<typeof fitSchema>;

export async function POST(req: Request) {
  let jd = "";
  try {
    const body = await req.json();
    jd = String(body?.jd ?? "").trim();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (jd.length < 40) {
    return Response.json(
      { error: "Please paste a fuller job description (at least a few lines)." },
      { status: 400 },
    );
  }
  jd = jd.slice(0, 12000); // cap input

  const userAgent = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");

  try {
    const { object } = await generateObject({
      model: gateway(CHAT_MODEL),
      schema: fitSchema,
      system: jdFitSystemPrompt(fullCareerContext()),
      prompt: `Analyze how well Matt fits the following job description. Be specific and calibrated.\n\n<job_description>\n${jd}\n</job_description>`,
      temperature: 0.2,
    });

    // Persist (best-effort) without blocking the response.
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        await supabase.from("jd_analyses").insert({
          role_title: object.role_title,
          company: object.company,
          jd_text: jd,
          fit_score: object.fit_score,
          result: object,
        });
        await recordEvent({
          type: "jd_submit",
          path: "/",
          meta: {
            role_title: object.role_title,
            company: object.company,
            fit_score: object.fit_score,
          },
          userAgent,
          referrer,
        });
      } catch (err) {
        console.error("[jd-fit] persist failed:", err);
      }
    }

    return Response.json(object);
  } catch (err) {
    console.error("[jd-fit] generation failed:", err);
    return Response.json(
      { error: "The analyzer is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
