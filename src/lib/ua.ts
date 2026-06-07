/** Tiny user-agent parser — enough to classify device/browser/OS for analytics. */
export function parseUserAgent(ua: string | null): {
  device: string;
  browser: string;
  os: string;
} {
  const s = ua || "";

  let device = "desktop";
  if (/\b(iPhone|iPod)\b/i.test(s) || /Android.*Mobile|Mobi/i.test(s)) device = "mobile";
  else if (/\biPad\b|Tablet|Android(?!.*Mobile)/i.test(s)) device = "tablet";

  let browser = "Other";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung";
  else if (/Chrome\//i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Version\/.*Safari/i.test(s)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(s)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Linux/i.test(s)) os = "Linux";

  return { device, browser, os };
}
