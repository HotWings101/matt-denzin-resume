import type { SVGProps } from "react";

/**
 * Brand glyphs that lucide-react v1 no longer ships. Sized via className
 * (e.g. `size-4`), colored via `currentColor`.
 */
export function LinkedinIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
    </svg>
  );
}

/**
 * Texas state flag — small full-color glyph for the "handcrafted in Texas"
 * colophon. Fixed flag colors (not currentColor). Size via className.
 */
export function TexasFlagIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 24"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* white field (top-right), red stripe (bottom-right), blue hoist band */}
      <rect width="36" height="24" fill="#fff" />
      <rect x="12" y="12" width="24" height="12" fill="#BF0A30" />
      <rect width="12" height="24" fill="#002868" />
      {/* lone star */}
      <polygon
        fill="#fff"
        points="6,8 6.9,10.76 9.8,10.76 7.45,12.47 8.35,15.24 6,13.53 3.65,15.24 4.55,12.47 2.2,10.76 5.1,10.76"
      />
    </svg>
  );
}
