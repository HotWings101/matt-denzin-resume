import type { HeatPoint } from "@/lib/analytics";

/**
 * Click density heatmap. Plots click coordinates (as % of the full document)
 * as additive glows over a dark canvas, so overlapping clicks build into
 * brighter hotspots. Capped for performance.
 */
export function ClickHeatmap({ points }: { points: HeatPoint[] }) {
  const capped = points.slice(0, 700);
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border"
      style={{ aspectRatio: "16 / 24", background: "#17150f" }}
    >
      {capped.length === 0 ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-white/40">
          No clicks recorded yet.
        </div>
      ) : (
        capped.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${Math.min(100, Math.max(0, p.xPct))}%`,
              top: `${Math.min(100, Math.max(0, p.yPct))}%`,
              width: 40,
              height: 40,
              background:
                "radial-gradient(circle, rgba(129,140,248,0.5), rgba(129,140,248,0) 70%)",
              mixBlendMode: "screen",
            }}
          />
        ))
      )}
      <div className="pointer-events-none absolute bottom-2 left-3 font-mono text-[0.58rem] uppercase tracking-wide text-white/45">
        click density · full page (normalized) · {capped.length} clicks
      </div>
    </div>
  );
}
