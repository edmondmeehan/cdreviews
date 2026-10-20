import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { listRoleAssignments, grantRole, revokeRole } from "@/lib/roles.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/roles")({
  staticData: { sitemap: false }, head: () => pageMeta("Roles and access — Admin — cdreviews.", "Roles and access on the cdreviews editorial desk."), component: RolesAdmin });

type RoleOpt = "admin" | "editor" | "senior_writer" | "writer" | "contributor";

function RolesAdmin() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleOpt>("editor");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const rolesQ = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => listRoleAssignments(),
    enabled: isAdmin,
  });

  const grant = useMutation({
    mutationFn: (vars: { email: string; role: RoleOpt }) =>
      grantRole({ data: { ...vars, redirectTo: `${window.location.origin}/reset-password` } }),
    onSuccess: (res, vars) => {
      setMsg({
        kind: "ok",
        text: res.invited
          ? `Invite sent to ${res.email}. They'll have ${vars.role} access once they set a password.`
          : `Granted ${vars.role} to ${res.email}`,
      });
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
    onError: (e: Error) => setMsg({ kind: "err", text: e.message }),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeRole({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "roles"] }),
  });

  if (loading) return <p className="font-mono text-[11px] text-ink/50">Loading…</p>;
  if (!isAdmin) {
    return (
      <div>
        <AdminHeader title="Roles" />
        <p className="font-mono text-[11px] text-ink/60">Admin role required to manage user roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <AdminHeader title="Roles & access" />

      <form
        onSubmit={(e) => { e.preventDefault(); setMsg(null); grant.mutate({ email, role }); }}
        className="grid md:grid-cols-[1fr_180px_auto] gap-4 items-end max-w-3xl border border-ink/10 p-6"
      >
        <Field label="User email">
          <input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="person@example.com" />
        </Field>
        <Field label="Role">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as RoleOpt)}>
            <option value="admin">Admin — full access</option>
            <option value="editor">Editor — everything but roles</option>
            <option value="senior_writer">Senior writer — write &amp; publish</option>
            <option value="writer">Writer — drafts only</option>
            <option value="contributor">Contributor — no admin access</option>
          </select>
        </Field>
        <AdminButton type="submit">{grant.isPending ? "Saving…" : "Grant / invite"}</AdminButton>
        {msg && (
          <p className={`md:col-span-3 font-mono text-[11px] ${msg.kind === "ok" ? "text-ink/80" : "text-vermil"}`}>{msg.text}</p>
        )}
        <p className="md:col-span-3 font-mono text-[10px] text-ink/40 leading-relaxed">
          If the email has no account yet, they're sent an invite to set a password and get this role when they accept. Granting an existing role is a no-op.
        </p>
      </form>

      <div>
        <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-ink/50 mb-4">Current assignments</h2>
        {rolesQ.isLoading ? (
          <p className="font-mono text-[11px] text-ink/50">Loading…</p>
        ) : rolesQ.error ? (
          <p className="font-mono text-[11px] text-vermil">{(rolesQ.error as Error).message}</p>
        ) : !rolesQ.data?.length ? (
          <p className="font-mono text-[11px] text-ink/50">No role assignments yet.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] font-mono text-[11px]">
            <thead>
              <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
                <th className="py-3">Email</th><th>Role</th><th>Last signed in</th><th>Granted</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rolesQ.data.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="py-3 text-ink">
                    {r.email}
                    {r.pending && <span className="ml-2 text-[9px] tracking-[0.2em] uppercase text-ink/40">Invited</span>}
                  </td>
                  <td className="text-vermil uppercase tracking-[0.2em]">{r.role}</td>
                  <td className="text-ink/80" title={r.lastSignInAt ? new Date(r.lastSignInAt).toLocaleString() : undefined}>
                    {r.lastSignInAt ? timeAgo(r.lastSignInAt) : <span className="text-ink/40">Never</span>}
                  </td>
                  <td className="text-ink/60">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="text-right">
                    <AdminButton tone="danger" onClick={() => { if (confirm(`Revoke ${r.role} from ${r.email}?`)) revoke.mutate(r.id); }}>Revoke</AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}

/** "3 hours ago", "2 days ago", or a date for anything older than a month. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString([], { dateStyle: "medium" });
}
