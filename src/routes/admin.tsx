import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { useAuth } from "@/lib/auth";
import type { Review } from "@/lib/cd-data";
import { useState } from "react";
import { useSiteSettings, useUpdateSiteSettings } from "@/lib/site-settings";
import { DeskMetrics } from "@/components/admin/DeskMetrics";
import { RecentChanges } from "@/components/admin/RecentChanges";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: "exclude-subtree" },
  component: AdminLayout,
  head: () => pageMeta("Editorial desk — Admin — cdreviews.", "Editorial desk on the cdreviews editorial desk."),
});

type AdminNavItem = { to: string; label: string; exact?: boolean; staffOnly?: boolean; adminOnly?: boolean; superAdminOnly?: boolean };
const NAV_GROUPS: { label: string; items: AdminNavItem[] }[] = [
  { label: "Desk", items: [
    { to: "/admin", label: "Overview", exact: true },
    { to: "/admin/guide", label: "Admin guide" },
  ] },
  { label: "Content", items: [
    { to: "/admin/reviews", label: "Reviews" },
    { to: "/admin/features", label: "Features" },
    { to: "/admin/lists", label: "Lists", staffOnly: true },
    { to: "/admin/featured", label: "Homepage feature", staffOnly: true },
    { to: "/admin/radio", label: "Radio", staffOnly: true },
  ] },
  { label: "Audience & business", items: [
    { to: "/admin/traffic", label: "Top pages", staffOnly: true },
    { to: "/admin/subscribers", label: "Subscribers", staffOnly: true },
    { to: "/admin/ads", label: "Ads", superAdminOnly: true },
  ] },
  { label: "Team", items: [
    { to: "/admin/contributors", label: "Contributors", staffOnly: true },
    { to: "/admin/applications", label: "Writer applications", staffOnly: true },
    { to: "/admin/roles", label: "Roles & access", adminOnly: true },
    { to: "/admin/activity", label: "Change log", staffOnly: true },
  ] },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, isStaff, isAdmin, isSuperAdmin, isWriter, canPublish, loading, signOut, roles } = useAuth();
  const allReviews = useCdStore((s) => s.reviews);
  const counts = useCdStore((s) => ({
    r: s.reviews.length, f: s.features.length, l: s.lists.length, c: s.contributors.length, s: s.subscribers.length,
  }));
  const isOverview = pathname === "/admin";
  const navigate = useNavigate();
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((n) => (!n.adminOnly || isAdmin) && (!n.staffOnly || isStaff) && (!n.superAdminOnly || isSuperAdmin)),
  })).filter((group) => group.items.length > 0);
  const visibleNav = visibleGroups.flatMap((group) => group.items);

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
    <div className="admin-desk bg-bone text-ink min-h-screen">
      <header className="border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="fr-display-bold text-[28px] text-ink leading-none">cdreviews. <span className="text-vermil text-[12px] font-mono tracking-[0.3em] align-middle ml-2">ADMIN</span></Link>
          <div className="grid grid-cols-2 items-center gap-x-4 gap-y-1 sm:flex sm:flex-wrap font-mono text-[10px] tracking-[0.25em] uppercase">
            <span className="col-span-2 sm:col-span-1 text-ink/50 break-all">{user.email}</span>
            <ChangePasswordButton email={user.email ?? ""} />
            <button onClick={signOut} className="text-ink/70 hover:text-vermil">Sign out</button>
            <Link to="/" className="text-ink/80 hover:text-vermil">→ View site</Link>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-4 sm:hidden">
          <label className="sr-only" htmlFor="admin-section">Admin section</label>
          <select id="admin-section" value={visibleNav.find((n) => n.exact ? pathname === n.to : pathname.startsWith(n.to))?.to ?? "/admin"} onChange={(e) => navigate({ to: e.target.value })} className="w-full min-h-11 bg-bone border border-rule px-3 text-base text-ink">
            {visibleGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((n) => <option key={n.to} value={n.to}>{n.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <nav aria-label="Admin sections" className="max-w-[1400px] mx-auto px-6 pb-5 hidden sm:grid sm:grid-cols-2 lg:grid-cols-[0.65fr_2fr_1.4fr_1fr] gap-x-6 gap-y-5">
          {visibleGroups.map((group) => (
            <section key={group.label} aria-label={group.label} className="min-w-0 border-t border-rule pt-3">
              <h2 className="font-mono text-[10px] uppercase text-mute mb-2">{group.label}</h2>
              <div className="flex flex-wrap gap-x-1 gap-y-1">
                {group.items.map((n) => {
                  const active = n.exact ? pathname === n.to : pathname.startsWith(`${n.to}/`) || pathname === n.to;
                  return (
                    <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact ?? false }} aria-current={active ? "page" : undefined} className={`inline-flex items-center min-h-11 px-3 py-2 border-l-2 text-[13px] font-medium transition-colors ${active ? "border-vermil bg-vermil/10 text-vermil" : "border-transparent text-ink/70 hover:bg-ink/5 hover:text-ink"}`}>
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto min-w-0 px-4 sm:px-6 py-8 sm:py-10">
        {isOverview ? (
          <div className="space-y-10">
            <h1 className="fr-display text-[44px] sm:text-[64px] text-ink">Editorial desk.</h1>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink/10 border border-ink/10">
              <Stat label="Reviews" n={counts.r} to="/admin/reviews" />
              <Stat label="Features" n={counts.f} to="/admin/features" />
              <Stat label="Lists" n={counts.l} to="/admin/lists" />
              <Stat label="Contributors" n={counts.c} to="/admin/contributors" />
              <Stat label="Subscribers" n={counts.s} to="/admin/subscribers" />
            </div>
            {roles.includes("super_admin") && <MaintenancePanel />}
            {isStaff && <DeskMetrics />}
            {isStaff && <RecentChanges />}
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

type R = Review;

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
    <Link to={to} className="bg-bone min-w-0 p-4 sm:p-6 hover:bg-ink/5 block">
      <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50">{label}</div>
      <div className="fr-score-card text-[44px] sm:text-[56px] text-ink mt-2">{n}</div>
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

function MaintenancePanel() {
  const { data } = useSiteSettings();
  const update = useUpdateSiteSettings();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const on = !!data?.maintenanceMode;
  const message = msg ?? data?.maintenanceMessage ?? "";
  async function save(patch: { maintenance_mode?: boolean; maintenance_message?: string | null }) {
    setBusy(true);
    const err = await update(patch);
    setBusy(false);
    if (err) alert(err);
  }
  return (
    <section className={`border p-4 sm:p-6 space-y-4 ${on ? "border-vermil" : "border-ink/10"}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">Site status</div>
          <p className="fr-display text-[28px] mt-1">{on ? "Under maintenance — readers see the splash page." : "Live — readers see the full site."}</p>
          <p className="text-[14px] text-ink/60 mt-1">Staff stay signed in and can still browse everything.</p>
        </div>
        <button
          disabled={busy || !data}
          onClick={() => { if (on || confirm("Take the site offline for readers?")) save({ maintenance_mode: !on }); }}
          className={`font-mono text-[11px] tracking-[0.25em] uppercase px-5 py-3 ${on ? "bg-ink text-bone" : "bg-vermil text-night"} disabled:opacity-50`}
        >
          {on ? "Bring site back online" : "Turn on maintenance mode"}
        </button>
      </div>
      <label className="block space-y-2">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/60">Splash message (optional)</span>
        <textarea rows={2} maxLength={400} value={message} onChange={(e) => setMsg(e.target.value)}
          placeholder="We're doing some work behind the counter. Leave your email and we'll let you know the moment we're back."
          className="w-full bg-bone border border-ink/20 px-3 py-2 text-[14px]" />
      </label>
      <button disabled={busy} onClick={() => save({ maintenance_message: message.trim() || null })} className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil hover:underline">Save message</button>
    </section>
  );
}
