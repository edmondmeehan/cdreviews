import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => pageMeta("Contact \u2014 cdreviews.", "Submissions, advertising, corrections, letters."),
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.enum(["submission", "press", "advertising", "correction", "other"]),
  message: z.string().trim().min(1).max(2000),
});

function Contact() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setStatus("err");
      return;
    }
    setErrors([]);
    setStatus("ok");
    e.currentTarget.reset();
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 10" title="Contact." dek="Submissions, press, advertising, corrections, letters to the editor." />
      <section className="max-w-[720px] mx-auto px-6 py-16">
        <form onSubmit={onSubmit} className="space-y-5 border border-rule p-8 bg-bone-warm">
          <Field label="Name"><input name="name" maxLength={100} required className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
          <Field label="Email"><input name="email" type="email" maxLength={255} required className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
          <Field label="Subject">
            <select name="subject" className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]">
              <option value="submission">Music submission</option>
              <option value="press">Press / interview</option>
              <option value="advertising">Advertising</option>
              <option value="correction">Correction</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Message"><textarea name="message" rows={7} maxLength={2000} required className="w-full bg-bone border border-rule px-3 py-2 font-mono text-[12px]" /></Field>
          <button className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 hover:bg-ink">Send →</button>
          {status === "ok" && <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermil">→ Thanks. We'll be in touch.</p>}
          {status === "err" && errors.map((e, i) => <p key={i} className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermil">· {e}</p>)}
        </form>
      </section>
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
