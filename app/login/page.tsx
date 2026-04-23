"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErr(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16 bg-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <Image
          src="/logo-stacked.png"
          alt="India Art Fair"
          width={220}
          height={220}
          priority
          className="mb-10"
        />
        <h1 className="iaf-display text-4xl mb-2">VIP Itineraries</h1>
        <p className="text-sm text-neutral-500 mb-10">Internal access only.</p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full h-12 inline-flex items-center justify-center gap-3 rounded-none border border-neutral-900 bg-neutral-900 text-white font-medium tracking-tight hover:bg-white hover:text-neutral-900 transition-colors disabled:opacity-50"
        >
          <GoogleMark />
          {loading ? "Signing in…" : "Sign in with Google"}
        </button>

        {err ? (
          <p className="mt-4 text-sm text-rose-700">{err}</p>
        ) : (
          <p className="mt-6 text-xs text-neutral-500">
            Use your India Art Fair workspace email.
          </p>
        )}
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#fff"
        d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.85H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.89 2.69-6.62z"
      />
      <path
        fill="#fff"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.7H.95v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#fff"
        d="M3.96 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.95a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#fff"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .95 4.95L3.96 7.28C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
