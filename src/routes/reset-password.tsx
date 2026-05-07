import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — cdreviews." }] }),
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash and fires a session event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evt) => {
      if (evt === "PASSWORD_RECOVERY" || evt === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords don't match.");
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) return setErr(error);
    setDone(true);
    setTimeout(() => navigate({ to: "/admin" }), 1200);
  }

  return (
    <div className="bg-ink text-bone min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[420px] border border-bone/10 p-8 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermil">§ Editorial</div>
          <h1 className="fr-display text-[40px] mt-2">Set new password.</h1>
        </div>
        {!ready ? (
          <p className="font-mono text-[11px] text-bone/60">Waiting for recovery link…</p>
        ) : done ? (
          <p className="font-mono text-[11px] text-vermil">Password updated. Redirecting…</p>
        ) : (
          <>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">New password</span>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink border border-bone/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Confirm</span>
              <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-ink border border-bone/20 px-3 py-2 font-mono text-[13px] outline-none focus:border-vermil" />
            </label>
            {err && <div className="font-mono text-[11px] text-vermil border border-vermil/40 p-3">{err}</div>}
            <button type="submit" disabled={busy}
              className="w-full font-mono text-[10px] tracking-[0.3em] uppercase bg-vermil text-bone py-3 hover:bg-bone hover:text-ink disabled:opacity-50">
              {busy ? "…" : "Update password"}
            </button>
          </>
        )}
        <Link to="/auth" search={{ redirect: "/admin" }} className="block text-center font-mono text-[10px] tracking-[0.25em] uppercase text-bone/60 hover:text-bone">
          ← Back to sign in
        </Link>
      </form>
    </div>
  );
}
