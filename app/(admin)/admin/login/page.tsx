"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/contacts");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Wrong password.");
        setLoading(false);
      }
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--paper-50)] px-6">
      <div className="w-full max-w-xs">
        <div className="mb-10">
          <h1 className="font-serif text-[2rem] leading-[2.25rem] font-medium tracking-tight text-[var(--ink-900)] mb-1">
            Admin
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-500)]">Campaign contacts & CRM</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="admin-pw"
            className="block text-[0.75rem] font-medium uppercase tracking-wider text-[var(--ink-700)] mb-2"
          >
            Password
          </label>
          <input
            id="admin-pw"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            disabled={loading}
            className={cn(
              "w-full bg-[var(--paper-50)] text-[1rem] text-[var(--ink-900)]",
              "border border-[var(--paper-300)] rounded-md py-3 px-4 outline-none",
              "focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent",
              "transition-all duration-150 disabled:opacity-50",
            )}
          />

          {error && (
            <p className="mt-3 text-[0.875rem] text-[var(--sentiment-neg-strong)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={cn(
              "mt-5 w-full bg-[var(--clay-600)] text-[var(--paper-50)]",
              "border border-[var(--clay-600)] text-[0.875rem] font-medium",
              "rounded-md px-5 py-2.5 hover:bg-[var(--clay-500)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-500)]",
              "transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
