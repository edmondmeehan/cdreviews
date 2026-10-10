import { createFileRoute } from "@tanstack/react-router";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton } from "@/components/admin/bits";
import {
  buildSubscriberCsv,
  subscriberExportFilename,
  uniqueSubscriberCount,
} from "@/lib/subscriber-export";

export const Route = createFileRoute("/admin/subscribers")({ component: SubsAdmin });

function SubsAdmin() {
  const subs = useCdStore((s) => s.subscribers);

  const unique = uniqueSubscriberCount(subs);

  function exportCsv() {
    const blob = new Blob([buildSubscriberCsv(subs)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = subscriberExportFilename();
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <AdminHeader
        title={`Subscribers (${unique}${unique === subs.length ? "" : ` · ${subs.length - unique} duplicate${subs.length - unique === 1 ? "" : "s"} hidden`})`}
        action={<AdminButton onClick={exportCsv}>Export CSV</AdminButton>}
      />
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
