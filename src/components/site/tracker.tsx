"use client";

import { useEffect } from "react";
import { track } from "@/lib/track-client";

/**
 * Mounts once in the root layout. Records a page_view and, via
 * IntersectionObserver, a one-time section_view for each [data-section].
 */
export function Tracker() {
  useEffect(() => {
    track("page_view");

    const seen = new Set<string>();
    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-section");
          if (entry.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            track("section_view", { section: id });
          }
        }
      },
      { threshold: 0.4 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
