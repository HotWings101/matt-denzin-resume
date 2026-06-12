import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, de-duping conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turn a label into a URL/anchor-safe slug (e.g. "Dealertrack / Dealer.com" → "dealertrack-dealer-com"). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable-ish anonymous visitor id stored in localStorage (client only). */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "md_visitor_id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id =
      "v_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36).slice(-4);
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
