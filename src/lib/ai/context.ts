import { knowledge } from "@/data/knowledge";
import { experience, profile } from "@/data/resume";

/**
 * The complete grounded context about Matt. Used by the JD-Fit Analyzer, which
 * needs the whole picture (the corpus is small) rather than top-k retrieval.
 */
export function fullCareerContext(): string {
  const passages = knowledge
    .map(
      (k, i) =>
        `[${i + 1}] ${k.topic}${k.source ? ` — ${k.source}` : ""}\n${k.content}`,
    )
    .join("\n\n");

  const roles = experience
    .flatMap((c) =>
      c.positions.map(
        (p) =>
          `- ${p.title} at ${c.name} (${p.start}–${p.end}): ${p.highlights.join(" ")}`,
      ),
    )
    .join("\n");

  return `PROFILE: ${profile.name}, ${profile.roles.join(" / ")}. ${profile.summary}\n\nKNOWLEDGE PASSAGES:\n${passages}\n\nROLE-BY-ROLE HIGHLIGHTS:\n${roles}`;
}
