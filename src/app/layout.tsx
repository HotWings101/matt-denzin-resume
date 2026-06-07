import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { Tracker } from "@/components/site/tracker";
import { profile } from "@/data/resume";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = `${profile.name} — ${profile.roles[0]} · AI-first`;
const description = profile.pitch;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s · ${profile.shortName}`,
  },
  description,
  keywords: [
    "Matt Denzin",
    "Matthew Denzin",
    "Product Manager",
    "AI Product Manager",
    "Technical Project Manager",
    "PMP",
    "Dallas Fort Worth",
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: `${profile.name} — Portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Tracker />
      </body>
    </html>
  );
}
