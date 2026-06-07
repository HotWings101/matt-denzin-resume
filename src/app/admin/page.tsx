import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { getDashboardData } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const data = await getDashboardData();
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <AdminDashboard {...data} headerAction={<SignOutButton />} />
    </main>
  );
}
