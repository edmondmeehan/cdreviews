import { createFileRoute } from "@tanstack/react-router";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton } from "@/components/admin/bits";

export const Route = createFileRoute("/admin/subscribers")({ component: SubsAdmin });

function SubsAdmin() {
  const subs = useCdStore((s) => s.subscribers);

  function exportCsv() {
    const csv = "email,signed_up\n" + subs.map((s) => `${s.email},${s.signedUp}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cdreviews-subscribers.csv";
    a.click();
  }

  return (
    <div>
      <AdminHeader title={`Subscribers (${subs.length})`} action={<AdminButton onClick={exportCsv}>Export CSV</AdminButton>} />
      {subs.length === 0 ? (
        <p className="font-mono text-[11px] text-ink/50">No subscribers yet. Try the footer signup form on the public site.</p>
      ) : (
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="text-left text-ink/50 tracking-[0.2em] uppercase text-[10px] border-b border-ink/10">
              <th className="py-3">Email</th><th>Signed up</th><th></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-ink/5">
                <td className="py-3 text-ink">{s.email}</td>
                <td className="text-ink/60">{new Date(s.signedUp).toLocaleString()}</td>
                <td className="text-right">
                  <AdminButton tone="danger" onClick={() => { if (confirm(`Remove ${s.email}?`)) cdActions.deleteSubscriber(s.id); }}>Remove</AdminButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
