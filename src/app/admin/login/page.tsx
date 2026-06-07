"use client";

import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { profile } from "@/data/resume";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      // Only honor a local same-origin path — reject absolute/protocol-relative
      // URLs to prevent an open-redirect after sign-in.
      const raw = new URLSearchParams(window.location.search).get("next") ?? "";
      const next =
        raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
          ? raw
          : "/admin";
      window.location.assign(next);
    } catch {
      setError("Could not sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-border bg-surface text-accent">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl">Admin access</h1>
          <p className="mt-2 text-sm text-muted">
            {profile.shortName}&apos;s career-site analytics
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card-paper space-y-4 rounded-2xl p-6"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="eyebrow block text-[0.65rem]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="eyebrow block text-[0.65rem]">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-clay/30 bg-clay/5 px-4 py-2.5 text-sm text-clay"
            >
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Spinner /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
