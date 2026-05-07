import { createFileRoute, Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useAuth } from "@/lib/auth";

const schema = z.object({ redirect: fallback(z.string(), "/admin").default("/admin") });

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(schema),
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — cdreviews." }] }),
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
    <div className="bg-ink text-bone min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[420px] border border-bone/10 p-8 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermil">§ Editorial</div>
          <h1 className="fr-display text-[40px] mt-2">{mode === "in" ? "Sign in." : "Create account."}</h1>
        </div>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-ink border border-bone/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-ink border border-bone/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
        </label>
        {err && <div className="font-mono text-[11px] text-vermil border border-vermil/40 p-3">{err}</div>}
        <button type="submit" disabled={busy}
          className="w-full font-mono text-[10px] tracking-[0.3em] uppercase bg-vermil text-bone py-3 hover:bg-bone hover:text-ink disabled:opacity-50">
          {busy ? "…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(null); }}
          className="w-full font-mono text-[10px] tracking-[0.25em] uppercase text-bone/60 hover:text-bone">
          {mode === "in" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
        </button>
      </form>
    </div>
  );
}
