"use client";

import { useState } from "react";
import { AlertCircle, Check, Sparkles, Target } from "lucide-react";
import { motion } from "motion/react";
import { Section } from "./section";
import { Reveal } from "./reveal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { track } from "@/lib/track-client";
import { cn } from "@/lib/utils";

interface JdFitResult {
  role_title: string | null;
  company: string | null;
  fit_score: number;
  summary: string;
  strengths: { requirement: string; evidence: string }[];
  gaps: string[];
  pitch: string;
}

const SAMPLE_JD = `Senior AI Product Manager — Applied AI Platform

We're hiring a Senior AI Product Manager to own the roadmap for our LLM-powered
features used by thousands of internal and customer-facing teams. You'll define
the strategy for agentic workflows, partner closely with ML and platform
engineering, and translate ambiguous problems into shipped products.

Requirements:
- 7+ years in product management, including AI/ML or data-driven products
- Proven track record taking 0→1 products from discovery to GA
- Strong cross-functional leadership across engineering, design, and operations
- Comfort with experimentation, metrics, and evaluation of model quality
- Excellent written communication and executive stakeholder management
- PMP, MBA, or equivalent operating rigor is a plus`;

export function JdAnalyzer() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JdFitResult | null>(null);

  async function analyze() {
    const value = jd.trim();
    if (!value || loading) return;

    track("jd_analyze_click");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/jd-fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jd: value }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          body?.error ??
            "Something went wrong analyzing that role. Please try again.",
        );
        return;
      }

      const data = (await res.json()) as JdFitResult;
      setResult(data);
    } catch {
      setError(
        "Couldn't reach the analyzer. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section
      id="jd-fit"
      index="01"
      eyebrow="For recruiters"
      title="Paste a job description. See the fit, instantly."
      intro="A grounded analysis of how Matt's experience maps to your specific role — strengths, honest gaps, and a tailored pitch."
      grid
    >
      <Reveal>
        <div className="card-paper overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Target className="size-4 text-accent" />
            <span className="eyebrow !text-foreground">JD-fit analyzer</span>
          </div>

          {/* Input */}
          <div className="p-5">
            <label htmlFor="jd-input" className="sr-only">
              Paste a job description
            </label>
            <Textarea
              id="jd-input"
              rows={7}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              disabled={loading}
              placeholder="Paste the full job description here — title, responsibilities, and requirements. The more detail, the sharper the read."
              className="scroll-slim"
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={analyze}
                disabled={loading || !jd.trim()}
                size="lg"
              >
                {loading ? (
                  <>
                    <Spinner className="text-accent-foreground" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Analyze fit
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading}
                onClick={() => {
                  setJd(SAMPLE_JD);
                  setError(null);
                }}
              >
                Try a sample
              </Button>
              <span className="text-xs text-faint">
                Grounded in Matt&apos;s résumé · no data stored
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Result */}
          {result && <Result result={result} />}
        </div>
      </Reveal>
    </Section>
  );
}

function Result({ result }: { result: JdFitResult }) {
  const score = Math.max(0, Math.min(100, Math.round(result.fit_score)));

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-border px-5 py-6 sm:px-6"
    >
      {/* Score + headline */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-6xl leading-none text-foreground">
              {score}
            </span>
            <span className="font-display text-2xl text-faint">/100</span>
          </div>
          <p className="eyebrow mt-2">Fit score</p>
          <div
            className="mt-3 h-2 w-40 overflow-hidden rounded-full bg-surface-2"
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fit score"
          >
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            />
          </div>
        </div>

        <div className="min-w-0">
          {(result.role_title || result.company) && (
            <p className="font-mono text-sm uppercase tracking-[0.14em] text-muted">
              {[result.role_title, result.company]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          )}
          <p className="mt-2 text-pretty text-[0.98rem] leading-relaxed text-foreground/85">
            {result.summary}
          </p>
        </div>
      </div>

      {/* Strengths + gaps */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {result.strengths.length > 0 && (
          <div>
            <h3 className="eyebrow !text-foreground mb-4">Where Matt fits</h3>
            <ul className="space-y-4">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft">
                    <Check className="size-3.5 text-accent-strong" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {s.requirement}
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">
                      {s.evidence}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.gaps.length > 0 && (
          <div>
            <h3 className="eyebrow !text-foreground mb-4">Gaps to discuss</h3>
            <ul className="space-y-3">
              {result.gaps.map((g, i) => (
                <li key={i} className="flex gap-3">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-faint" />
                  <p className="text-sm leading-relaxed text-muted">{g}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pitch */}
      {result.pitch && (
        <div
          className={cn(
            "mt-8 rounded-2xl border border-accent-ring/60 bg-accent-soft p-5 sm:p-6",
          )}
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-accent-strong" />
            <span className="eyebrow !text-accent-strong">Matt&apos;s pitch</span>
          </div>
          <p className="text-pretty text-[1.02rem] leading-relaxed text-foreground/90">
            {result.pitch}
          </p>
        </div>
      )}
    </motion.div>
  );
}
