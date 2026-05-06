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
  { to: "/admin/lists", label: "Lists" },
  { to: "/admin/contributors", label: "Contributors" },
  { to: "/admin/subscribers", label: "Subscribers" },
  { to: "/admin/roles", label: "Roles", adminOnly: true },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, isStaff, loading, signOut, roles } = useAuth();
  const counts = useCdStore((s) => ({
    r: s.reviews.length, f: s.features.length, l: s.lists.length, c: s.contributors.length, s: s.subscribers.length,
  }));
  const isOverview = pathname === "/admin";

  if (loading) {
    return (
      <div className="bg-ink text-bone min-h-screen flex items-center justify-center">
        <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-bone/50">Checking access…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-ink text-bone min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="fr-display text-[48px]">Sign in required.</h1>
        <p className="fr-blurb text-[16px] text-bone/60 max-w-[50ch]">
          The editorial desk is staff-only. Sign in to manage reviews, features, and lists.
        </p>
        <Link to="/auth" search={{ redirect: pathname }} className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil hover:underline">
          → Go to sign in
        </Link>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="bg-ink text-bone min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="fr-display text-[48px]">No access.</h1>
        <p className="fr-blurb text-[16px] text-bone/60 max-w-[50ch]">
          Your account ({user.email}) doesn't have admin or editor permissions. Ask an admin to grant you access.
        </p>
        <div className="flex items-center gap-6 font-mono text-[11px] tracking-[0.25em] uppercase">
          <button onClick={signOut} className="text-vermil hover:underline">Sign out</button>
          <Link to="/" className="text-bone/70 hover:text-bone">→ Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink text-bone min-h-screen">
      <header className="border-b border-bone/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="fr-display-bold text-[28px] text-bone leading-none">cdreviews. <span className="text-vermil text-[12px] font-mono tracking-[0.3em] align-middle ml-2">ADMIN</span></Link>
          <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.25em] uppercase">
            <span className="text-bone/50">{user.email}</span>
            <button onClick={() => { if (confirm("Reset all admin data to seed?")) cdActions.resetAll(); }} className="text-vermil hover:underline">Reset data</button>
            <button onClick={signOut} className="text-bone/70 hover:text-vermil">Sign out</button>
            <Link to="/" className="text-bone/80 hover:text-vermil">→ View site</Link>
          </div>
        </div>
        <nav className="max-w-[1400px] mx-auto px-6 pb-3 flex flex-wrap gap-5">
          {NAV.filter((n) => !n.adminOnly || roles.includes("admin")).map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`font-mono text-[11px] tracking-[0.2em] uppercase ${active ? "text-vermil" : "text-bone/70 hover:text-bone"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {isOverview ? (
          <div className="space-y-10">
            <h1 className="fr-display text-[64px] text-bone">Editorial desk.</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-bone/10 border border-bone/10">
              <Stat label="Reviews" n={counts.r} to="/admin/reviews" />
              <Stat label="Features" n={counts.f} to="/admin/features" />
              <Stat label="Lists" n={counts.l} to="/admin/lists" />
              <Stat label="Contributors" n={counts.c} to="/admin/contributors" />
              <Stat label="Subscribers" n={counts.s} to="/admin/subscribers" />
            </div>
            <p className="fr-blurb text-[16px] text-bone/60 max-w-[60ch]">
              All edits are saved to your browser. Wire up Lovable Cloud (auth + Postgres) when you're ready and this admin will swap to a real backend.
            </p>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

function Stat({ label, n, to }: { label: string; n: number; to: string }) {
  return (
    <Link to={to} className="bg-ink p-6 hover:bg-bone/5 block">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-bone/50">{label}</div>
      <div className="fr-score-card text-[56px] text-bone mt-2">{n}</div>
    </Link>
  );
}
