"use client";

import { useEffect, useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data/resume";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

// Absolute (`/#…`) so they resolve from internal pages too, not just home.
const links: NavLink[] = [
  { href: "/#jd-fit", label: "Fit Analyzer" },
  { href: "/#experience", label: "Experience" },
  { href: "/#recommendations", label: "Endorsements" },
  { href: "/#education", label: "Education" },
  { href: "/#skills", label: "Capabilities" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Internal pages have no dark hero behind the nav, so render it solid there.
  const solid = scrolled || open || pathname !== "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid
          ? "border-b border-border bg-surface/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <a
          href="/#top"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-2.5 rounded-full"
        >
          <span
            className={cn(
              "font-display text-lg font-medium tracking-tight transition-colors group-hover:text-accent",
              solid ? "text-foreground" : "text-white",
            )}
          >
            {profile.name}
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                solid
                  ? "text-muted hover:text-foreground"
                  : "text-white/80 hover:text-white",
              )}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/good-vibes"
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors",
              solid
                ? "text-muted hover:text-foreground"
                : "text-white/80 hover:text-white",
            )}
          >
            Good Vibes
          </Link>
          <a
            href="/Matthew-Denzin-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              solid
                ? "text-muted hover:text-foreground"
                : "text-white/80 hover:text-white",
            )}
          >
            <FileText className="size-3.5" />
            Résumé
          </a>
          <a
            href="/#contact"
            className="ml-2 inline-flex h-9 items-center rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_8px_24px_-12px_rgba(79,70,229,0.6)] transition-all hover:bg-accent-strong active:scale-[0.98]"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-nav-mobile"
          className="grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-nav-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease }}
            className="px-4 pb-4 md:hidden"
          >
            <div className="card-paper flex flex-col gap-1 rounded-2xl p-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/good-vibes"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
              >
                Good Vibes
              </Link>
              <a
                href="/Matthew-Denzin-Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-accent"
              >
                <FileText className="size-4" />
                Résumé (PDF)
              </a>
              <a
                href="/#contact"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
              >
                Get in touch
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
