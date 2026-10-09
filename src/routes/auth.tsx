import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useAuth } from "@/lib/auth";

const schema = z.object({ redirect: fallback(z.string(), "/admin").default("/admin") });

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(schema),
  component: AuthPage,
  head: () => pageMeta("Sign in \u2014 cdreviews.", "Sign in to your cdreviews editorial account."),
});

function AuthPage() {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const { redirect } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function forgot() {
    setErr(null); setInfo(null);
    if (!email) return setErr("Enter your email above first.");
    setBusy(true);
    const { error } = await resetPassword(email);
    setBusy(false);
    if (error) setErr(error);
    else setInfo("Check your email for a password reset link.");
  }

  if (!loading && user) return <Navigate to={redirect} />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) setErr(error);
    else navigate({ to: redirect });
  }

  return (
    <div className="bg-bone text-ink min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[420px] border border-ink/10 p-8 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermil">§ Editorial</div>
          <h1 className="fr-display text-[40px] mt-2">{mode === "in" ? "Sign in." : "Create account."}</h1>
        </div>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bone border border-ink/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bone border border-ink/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
        </label>
        {err && <div className="font-mono text-[11px] text-vermil border border-vermil/40 p-3">{err}</div>}
        {info && <div className="font-mono text-[11px] text-ink/80 border border-ink/30 p-3">{info}</div>}
        <button type="submit" disabled={busy}
          className="w-full font-mono text-[10px] tracking-[0.3em] uppercase bg-vermil text-night py-3 hover:bg-ink hover:text-bone disabled:opacity-50">
          {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(null); setInfo(null); }}
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/60 hover:text-ink">
            {mode === "in" ? "Sign up →" : "Sign in →"}
          </button>
          {mode === "in" && (
            <button type="button" onClick={forgot} disabled={busy}
              className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/60 hover:text-vermil disabled:opacity-50">
              Forgot password?
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
