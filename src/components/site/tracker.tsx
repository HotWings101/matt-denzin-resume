"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/track-client";

/**
 * Mounts once in the root layout and wires full-page analytics: page view,
 * scroll depth, click heatmap, section views, active time, and exit.
 */
export function Tracker() {
  useEffect(() => initAnalytics(), []);
  return null;
}
