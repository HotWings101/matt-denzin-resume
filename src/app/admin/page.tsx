import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/admin/dashboard";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getAnalytics } from "@/lib/analytics";
import { getRecentVisitorSessions } from "@/lib/visitors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

const ALLOWED_RANGES = [7, 30, 90];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const requested = Number(sp.range);
  const days = ALLOWED_RANGES.includes(requested) ? requested : 30;
  const [data, visitors] = await Promise.all([
    getAnalytics(days),
    getRecentVisitorSessions(days),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <AnalyticsDashboard
        data={data}
        visitors={visitors}
        signOut={<SignOutButton />}
      />
    </main>
  );
}
