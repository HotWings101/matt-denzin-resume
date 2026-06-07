import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { profile } from "@/data/resume";
import { LinkedinIcon } from "@/components/ui/icons";

interface FooterLink {
  href: string;
  label: string;
}

const quickLinks: FooterLink[] = [
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#jd-fit", label: "JD Fit" },
  { href: "#recommendations", label: "Recommendations" },
  { href: "#contact", label: "Contact" },
];

/**
 * Site footer — editorial close to the page: identity, in-page navigation,
 * and direct contact channels, capped by a mono colophon. Server component.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative">
      <div className="rule" />
      <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Identity */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-2xl leading-none text-foreground">
              {profile.name}
            </p>
            <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-muted">
              AI-first Product &amp; Operations Leader — {profile.location}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer" className="flex flex-col">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex flex-col">
            <p className="eyebrow mb-4">Contact</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
                >
                  <Mail className="size-4 shrink-0 text-faint transition-colors group-hover:text-accent" />
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
                >
                  <LinkedinIcon className="size-4 shrink-0 text-faint transition-colors group-hover:text-accent" />
                  {profile.linkedinLabel}
                  <ArrowUpRight className="size-3.5 shrink-0 text-faint transition-colors group-hover:text-accent" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Colophon */}
        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {profile.name}
          </p>
          <p className="text-faint/90">
            Built as an AI-native product · Next.js · Supabase · Vercel AI SDK
          </p>
        </div>
      </div>
    </footer>
  );
}
