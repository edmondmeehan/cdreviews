import { AdSlot } from "@/components/site/AdSlot";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contribute")({
  component: Contribute,
  head: () => pageMeta("Write for us — cdreviews.", "Pitch the desk. Send us your published work."),
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  samples: z.string().trim().min(1, "Add at least one link to published work").max(2000),
  note: z.string().trim().max(1000).optional(),
});

function Contribute() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setStatus("err");
      return;
    }
    setErrors([]);
    setStatus("sending");
    const { error } = await supabase.from("contributor_applications").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      samples: parsed.data.samples,
      note: parsed.data.note || null,
    });
    if (error) {
      setErrors(["Something went wrong sending that. Try again in a moment."]);
      setStatus("err");
      return;
    }
    form.reset();
    setStatus("ok");
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 11" title="Write for us." dek="We're always reading. Send the desk your best published work." />
      <section className="max-w-[720px] mx-auto px-6 py-16 space-y-8">
        <div className="fr-excerpt text-[18px] text-ink-2 space-y-4">
          <p>
            cdreviews. has run on contributors since 1995. If you write about music and have clips to
            prove it, we want to read them.
          </p>
          <p>
            Send two or three links to work you've published — reviews, essays, interviews — and a
            line or two about what you listen to. If it's a fit, an editor will write back.
          </p>
        </div>
        {status === "ok" ? (
          <div className="border border-rule p-8 bg-bone-warm space-y-3">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">→ Received.</p>
            <p className="fr-excerpt text-[17px] text-ink-2">
              Your samples are with the desk. We read everything; we write back when it's a fit.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 border border-rule p-8 bg-bone-warm">
            <Field label="Name"><input name="name" maxLength={100} required className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
            <Field label="Email"><input name="email" type="email" maxLength={255} required className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
            <Field label="Published work — links, one per line">
              <textarea name="samples" rows={4} maxLength={2000} required placeholder={"https://…\nhttps://…"} className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" />
            </Field>
            <Field label="Anything else (optional)"><textarea name="note" rows={3} maxLength={1000} className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
            <button disabled={status === "sending"} className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 hover:bg-ink disabled:opacity-50">
              {status === "sending" ? "Sending…" : "Send to the desk →"}
            </button>
            {status === "err" && errors.map((e, i) => <p key={i} className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermil">· {e}</p>)}
          </form>
        )}
      </section>
      <AdSlot placement="home_break" className="pb-16" />
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">{label}</span>
      {children}
    </label>
  );
}
