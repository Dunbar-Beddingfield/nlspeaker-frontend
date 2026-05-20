"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic } from "lucide-react";
import { adminLogin } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { COMPANY } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await adminLogin(email, password);
      login(res.data.accessToken, res.data.admin);
      router.push("/admin");
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-4 glow-gold">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Admin Portal</h1>
          <p className="text-sm text-[#64748B] mt-1">{COMPANY.shortName}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="gradient-border bg-[#111827] rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.15)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-lg bg-[#0B1120] border border-[rgba(245,158,11,0.15)] text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-gold text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
