import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Landing page for the links in our auth emails. The emails point at
// cdreviews.com/confirm?token_hash=…&type=…&next=… (instead of the raw
// supabase.co verify URL); this page verifies the token and moves on.
const TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

type Search = { token_hash?: string; type?: string; next?: string };

export const Route = createFileRoute("/confirm")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): Search => ({
    token_hash: typeof s.token_hash === "string" ? s.token_hash : undefined,
    type: typeof s.type === "string" ? s.type : undefined,
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: ConfirmPage,
  head: () => pageMeta("Confirming — cdreviews.", "Confirming your cdreviews email link."),
});

/** Only allow same-site paths, so the link can't bounce people to another site. */
function safeNext(next: string | undefined, type: string | undefined) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return type === "invite" || type === "recovery" ? "/reset-password" : "/admin";
}

function ConfirmPage() {
  const { token_hash, type, next } = Route.useSearch();
  const [err, setErr] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token_hash || !type || !TYPES.includes(type as EmailOtpType)) {
      setErr("This link is incomplete. Please use the button in your most recent email.");
      return;
    }
    supabase.auth.verifyOtp({ token_hash, type: type as EmailOtpType }).then(({ error }) => {
      if (error) {
        setErr(/expired|invalid/i.test(error.message)
          ? "This link has expired or has already been used. Ask for a new one and use it within an hour."
          : error.message);
        return;
      }
      // Full navigation so every part of the app picks up the new session.
      window.location.replace(safeNext(next, type));
    });
  }, [token_hash, type, next]);

  return (
    <div className="bg-bone text-ink min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[420px] border border-ink/10 p-8 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermil">§ Editorial</div>
          <h1 className="fr-display text-[40px] mt-2">{err ? "Link problem." : "One moment."}</h1>
        </div>
        {err ? (
          <div className="font-mono text-[11px] text-vermil border border-vermil/40 p-3">{err}</div>
        ) : (
          <p className="font-mono text-[11px] text-ink/60">Checking your link…</p>
        )}
        <Link to="/auth" search={{ redirect: "/admin" }} className="block text-center font-mono text-[10px] tracking-[0.25em] uppercase text-ink/60 hover:text-ink">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
