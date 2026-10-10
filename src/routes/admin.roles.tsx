import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { listRoleAssignments, grantRole, revokeRole } from "@/lib/roles.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/roles")({ component: RolesAdmin });

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
    mutationFn: (vars: { email: string; role: RoleOpt }) => grantRole({ data: vars }),
    onSuccess: (res) => {
      setMsg({ kind: "ok", text: `Granted ${role} to ${res.email}` });
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
        <AdminButton type="submit">{grant.isPending ? "Granting…" : "Grant role"}</AdminButton>
        {msg && (
          <p className={`md:col-span-3 font-mono text-[11px] ${msg.kind === "ok" ? "text-ink/80" : "text-vermil"}`}>{msg.text}</p>
        )}
        <p className="md:col-span-3 font-mono text-[10px] text-ink/40 leading-relaxed">
          The user must already have signed up at <span className="text-ink/70">/auth</span>. Granting an existing role is a no-op.
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
          <table className="w-full font-mono text-[11px]">
            <thead>
              <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
                <th className="py-3">Email</th><th>Role</th><th>Granted</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rolesQ.data.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="py-3 text-ink">{r.email}</td>
                  <td className="text-vermil uppercase tracking-[0.2em]">{r.role}</td>
                  <td className="text-ink/60">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="text-right">
                    <AdminButton tone="danger" onClick={() => { if (confirm(`Revoke ${r.role} from ${r.email}?`)) revoke.mutate(r.id); }}>Revoke</AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
