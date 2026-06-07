import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, de-duping conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
