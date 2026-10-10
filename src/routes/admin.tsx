import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — cdreviews." }] }),
});

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/features", label: "Features" },
  { to: "/admin/lists", label: "Lists", staffOnly: true },
  { to: "/admin/contributors", label: "Contributors", staffOnly: true },
  { to: "/admin/subscribers", label: "Subscribers", staffOnly: true },
  { to: "/admin/roles", label: "Roles", adminOnly: true },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, isStaff, isWriter, canPublish, loading, signOut, roles } = useAuth();
  const allReviews = useCdStore((s) => s.reviews);
  const counts = useCdStore((s) => ({
    r: s.reviews.length, f: s.features.length, l: s.lists.length, c: s.contributors.length, s: s.subscribers.length,
  }));
  const isOverview = pathname === "/admin";

  if (loading) {
    return (
      <div className="bg-bone text-ink min-h-screen flex items-center justify-center">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink/50">Checking access…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-bone text-ink min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="fr-display text-[48px]">Sign in required.</h1>
        <p className="fr-blurb text-[16px] text-ink/60 max-w-[50ch]">
          The editorial desk is staff-only. Sign in to manage reviews, features, and lists.
        </p>
        <Link to="/auth" search={{ redirect: pathname }} className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil hover:underline">
          → Go to sign in
        </Link>
      </div>
    );
  }

  if (!isWriter) {
    return (
      <div className="bg-bone text-ink min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="fr-display text-[48px]">No access.</h1>
        <p className="fr-blurb text-[16px] text-ink/60 max-w-[50ch]">
          Your account ({user.email}) doesn't have admin or editor permissions. Ask an admin to grant you access.
        </p>
        <div className="flex items-center gap-6 font-mono text-[11px] tracking-[0.25em] uppercase">
          <button onClick={signOut} className="text-vermil hover:underline">Sign out</button>
          <Link to="/" className="text-ink/70 hover:text-ink">→ Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="fr-display-bold text-[28px] text-ink leading-none">cdreviews. <span className="text-vermil text-[12px] font-mono tracking-[0.3em] align-middle ml-2">ADMIN</span></Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase">
            <span className="text-ink/50 break-all">{user.email}</span>
            <ChangePasswordButton email={user.email ?? ""} />
            <button onClick={signOut} className="text-ink/70 hover:text-vermil">Sign out</button>
            <Link to="/" className="text-ink/80 hover:text-vermil">→ View site</Link>
          </div>
        </div>
        <nav className="max-w-[1400px] mx-auto px-6 pb-3 flex flex-wrap gap-x-5 gap-y-2">
          {NAV.filter((n) => (!n.adminOnly || roles.includes("admin")) && (!n.staffOnly || isStaff)).map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`font-mono text-[11px] tracking-[0.2em] uppercase ${active ? "text-vermil" : "text-ink/70 hover:text-ink"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {isOverview ? (
          <div className="space-y-10">
            <h1 className="fr-display text-[64px] text-ink">Editorial desk.</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
              <Stat label="Reviews" n={counts.r} to="/admin/reviews" />
              <Stat label="Features" n={counts.f} to="/admin/features" />
              <Stat label="Lists" n={counts.l} to="/admin/lists" />
              <Stat label="Contributors" n={counts.c} to="/admin/contributors" />
              <Stat label="Subscribers" n={counts.s} to="/admin/subscribers" />
            </div>
            <Dashboard reviews={allReviews} userId={user.id} canPublish={canPublish} />
            <p className="fr-blurb text-[16px] text-ink/60 max-w-[60ch]">
              Edits save straight to the live site. Drafts stay hidden until you publish them.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

type R = ReturnType<typeof useCdStore<import("@/lib/cd-data").Review[]>>[number];

function Dashboard({ reviews, userId, canPublish }: { reviews: R[]; userId: string; canPublish: boolean }) {
  const mine = reviews.filter((r) => r.createdBy === userId && r.status === "draft");
  const waiting = reviews.filter((r) => r.status === "draft" && r.submittedAt)
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <ReviewQueue title="My drafts" empty="No drafts of yours yet." items={mine} />
      <ReviewQueue
        title="Awaiting approval"
        empty="Nothing waiting for approval."
        items={waiting}
        action={canPublish ? (r) => (
          <button onClick={() => cdActions.setReviewsStatus([r.id], "published")} className="text-vermil hover:underline">Publish</button>
        ) : undefined}
      />
    </div>
  );
}

function ReviewQueue({ title, empty, items, action }: { title: string; empty: string; items: R[]; action?: (r: R) => React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil mb-3">{title} · {items.length}</h2>
      {items.length === 0 ? <p className="font-mono text-[11px] text-ink/50">{empty}</p> : (
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {items.slice(0, 12).map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between gap-3 font-mono text-[11px]">
              <Link to="/admin/reviews/$id" params={{ id: r.id }} className="text-ink hover:text-vermil truncate">{r.artist} — {r.title}</Link>
              <span className="uppercase tracking-[0.2em] shrink-0">{action ? action(r) : (r.submittedAt ? <span className="text-ink/50">Submitted</span> : null)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, n, to }: { label: string; n: number; to: string }) {
  return (
    <Link to={to} className="bg-bone p-6 hover:bg-ink/5 block">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50">{label}</div>
      <div className="fr-score-card text-[56px] text-ink mt-2">{n}</div>
    </Link>
  );
}

function ChangePasswordButton({ email }: { email: string }) {
  const { resetPassword } = useAuth();
  async function send() {
    if (!email) return;
    if (!confirm(`Send a password reset link to ${email}?`)) return;
    const { error } = await resetPassword(email);
    if (error) alert(error);
    else alert("Password reset email sent. Check your inbox.");
  }
  return (
    <button onClick={send} className="text-ink/70 hover:text-vermil">
      Change password
    </button>
  );
}
