import { AdSlot } from "@/components/site/AdSlot";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_LIMITS,
  applicationErrors,
  applicationSchema,
  isDuplicateApplicationError,
  type ApplicationErrors,
  type ApplicationField,
} from "@/lib/contributor-application";

export const Route = createFileRoute("/contribute")({
  staticData: { sitemap: true },
  component: Contribute,
  head: () => pageMeta("Write for us — cdreviews.", "Pitch the desk. Send us your published work."),
});

const FIELD_ORDER: ApplicationField[] = ["name", "email", "samples", "note"];

// 16px on phones stops iOS from zooming into the field on focus.
const INPUT =
  "w-full bg-bone border border-rule px-3 py-3 min-h-11 font-mono text-[16px] sm:text-[13px] text-ink placeholder:text-mute focus:outline-none focus:border-vermil focus:ring-1 focus:ring-vermil aria-[invalid=true]:border-vermil";

function Contribute() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "ok") {
      successRef.current?.focus();
      successRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [status]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Honeypot: real people never see or fill this field.
    if (String(fd.get("website") ?? "").trim()) {
      form.reset();
      setStatus("ok");
      return;
    }
    const input = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      samples: String(fd.get("samples") ?? ""),
      note: String(fd.get("note") ?? ""),
    };
    const fieldErrors = applicationErrors(input);
    if (fieldErrors) {
      setErrors(fieldErrors);
      setFormError(null);
      const first = FIELD_ORDER.find((f) => fieldErrors[f]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const data = applicationSchema.parse(input);
    setErrors({});
    setFormError(null);
    setStatus("sending");
    const { error } = await supabase.from("contributor_applications").insert(data);
    if (error) {
      setStatus("idle");
      setFormError(
        isDuplicateApplicationError(error.message)
          ? "We already have an application from this email today. It's with the desk — no need to send it again."
          : "Something went wrong sending that. Check your connection and try again.",
      );
      return;
    }
    form.reset();
    setStatus("ok");
  }

  function clearError(field: ApplicationField) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 11" title="Write for us." dek="We're always reading. Send the desk your best published work." />
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div className="fr-excerpt text-[17px] sm:text-[18px] text-ink-2 space-y-4">
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
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="border border-rule p-6 sm:p-8 bg-bone-warm space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-vermil"
          >
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-vermil">→ Received.</p>
            <p className="fr-excerpt text-[17px] text-ink-2">
              Your samples are with the desk. We read everything; we write back when it's a fit.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="font-mono text-[11px] tracking-[0.2em] uppercase text-mute hover:text-vermil underline underline-offset-4 min-h-11"
            >
              Send another application
            </button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            noValidate
            aria-busy={status === "sending"}
            className="relative space-y-5 border border-rule p-5 sm:p-8 bg-bone-warm"
          >
            <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
              <label>
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <Field id="name" label="Name" error={errors.name}>
              <input
                id="name" name="name" autoComplete="name" maxLength={APPLICATION_LIMITS.name}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}
                onChange={() => clearError("name")} className={INPUT}
              />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input
                id="email" name="email" type="email" inputMode="email" autoComplete="email"
                autoCapitalize="off" spellCheck={false} maxLength={APPLICATION_LIMITS.email}
                aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
                onChange={() => clearError("email")} className={INPUT}
              />
            </Field>
            <Field
              id="samples" label="Published work — links, one per line" error={errors.samples}
              hint="Two or three links is plenty."
            >
              <textarea
                id="samples" name="samples" rows={4} maxLength={APPLICATION_LIMITS.samples}
                autoCapitalize="off" spellCheck={false} placeholder={"https://…\nhttps://…"}
                aria-invalid={!!errors.samples}
                aria-describedby={errors.samples ? "samples-hint samples-error" : "samples-hint"}
                onChange={() => clearError("samples")} className={INPUT}
              />
            </Field>
            <Field id="note" label="Anything else (optional)" error={errors.note}>
              <textarea
                id="note" name="note" rows={3} maxLength={APPLICATION_LIMITS.note}
                aria-invalid={!!errors.note} aria-describedby={errors.note ? "note-error" : undefined}
                onChange={() => clearError("note")} className={INPUT}
              />
            </Field>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto min-h-12 font-mono text-[12px] sm:text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 hover:bg-ink hover:text-bone disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send to the desk →"}
            </button>
            <p role="alert" className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil empty:hidden">
              {formError}
            </p>
          </form>
        )}
      </section>
      <AdSlot placement="home_break" className="pb-16" />
      <SiteFooter />
    </div>
  );
}

function Field({
  id, label, hint, error, children,
}: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.25em] uppercase text-vermil">
        {label}
      </label>
      {children}
      {hint && <p id={`${id}-hint`} className="font-mono text-[11px] text-mute">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="font-mono text-[11px] tracking-[0.08em] text-vermil">· {error}</p>
      )}
    </div>
  );
}
