import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCdStore, cdActions } from "@/lib/cd-store";
import { AdminHeader, AdminButton, Field, inputCls } from "@/components/admin/bits";
import { slug as slugify, type Contributor } from "@/lib/cd-data";

export const Route = createFileRoute("/admin/contributors")({ component: ContribAdmin });

function blank(): Contributor { return { id: "", name: "", role: "Contributor", bio: "", city: "" }; }

function ContribAdmin() {
  const list = useCdStore((s) => s.contributors);
  const [e, setE] = useState<Contributor | null>(null);

  function save() {
    if (!e) return;
    const id = e.id || slugify(e.name);
    cdActions.upsertContributor({ ...e, id });
    setE(null);
  }

  return (
    <div>
      <AdminHeader title="Contributors" action={<AdminButton onClick={() => setE(blank())}>+ Add contributor</AdminButton>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((c) => (
          <div key={c.id} className="border border-ink/10 p-5 space-y-2">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{c.role}</div>
            <div className="fr-card-title text-[22px] text-ink">{c.name}</div>
            <div className="font-mono text-[10px] text-ink/50">{c.city}</div>
            <p className="text-[13px] text-ink/70">{c.bio}</p>
            <div className="flex gap-2 pt-2">
              <AdminButton tone="ghost" onClick={() => setE(c)}>Edit</AdminButton>
              <AdminButton tone="danger" onClick={() => { if (confirm(`Remove ${c.name}?`)) cdActions.deleteContributor(c.id); }}>Remove</AdminButton>
            </div>
          </div>
        ))}
      </div>

      {e && (
        <div className="fixed inset-0 bg-bone/90 z-50 overflow-auto p-6 flex items-start justify-center">
          <div className="bg-bone border border-ink/20 max-w-[600px] w-full p-8 space-y-5">
            <h2 className="fr-display text-[32px] text-ink">{e.id ? "Edit" : "New"} contributor</h2>
            <Field label="Name"><input className={inputCls} maxLength={120} value={e.name} onChange={(ev) => setE({ ...e, name: ev.target.value })} /></Field>
            <Field label="Role">
              <select className={inputCls} value={e.role} onChange={(ev) => setE({ ...e, role: ev.target.value as Contributor["role"] })}>
                {(["Editor-in-Chief","Senior Editor","Editor","Staff Writer","Contributor"] as const).map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="City"><input className={inputCls} maxLength={80} value={e.city} onChange={(ev) => setE({ ...e, city: ev.target.value })} /></Field>
            <Field label="Bio"><textarea className={inputCls + " min-h-[120px]"} maxLength={600} value={e.bio} onChange={(ev) => setE({ ...e, bio: ev.target.value })} /></Field>
            <div className="flex justify-end gap-2">
              <AdminButton tone="ghost" onClick={() => setE(null)}>Cancel</AdminButton>
              <AdminButton onClick={save}>Save</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
