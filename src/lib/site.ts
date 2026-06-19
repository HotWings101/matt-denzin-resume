/**
 * Site identity helpers. The résumé is served on more than one of our own
 * hosts (matthewdenzin.ai, matthewdenzin.com → redirect, and the *.vercel.app
 * deployment URLs). A referrer pointing at any of these is an internal hop —
 * a "self-referral" — and must NOT be counted as an external acquisition
 * source. Add new owned domains to OWN_HOST_RE.
 */

/** Hostnames (www-stripped, lowercased) that belong to this site itself. */
export const OWN_HOST_RE = /(^|\.)matthewdenzin\.(ai|com)$|\.vercel\.app$/i;

/** True when a referrer URL (or bare host) belongs to the site itself. */
export function isInternalReferrer(referrer: string | null): boolean {
  if (!referrer) return false;
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    host = referrer;
  }
  host = host.replace(/^www\./, "").toLowerCase();
  return OWN_HOST_RE.test(host);
}
