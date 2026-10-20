import { AdSlot } from "@/components/site/AdSlot";
import { pageMeta } from "@/lib/page-meta";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PageHead } from "@/components/site/bits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSiteSettings } from "@/lib/site-settings";
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

type Variant = "site" | "splash";

// 16px on phones stops iOS from zooming into the field on focus.
const INPUT_BASE =
  "w-full px-3 py-3 min-h-11 font-mono text-[16px] sm:text-[13px] text-ink placeholder:text-mute focus:outline-none focus:border-vermil focus:ring-1 focus:ring-vermil aria-[invalid=true]:border-vermil";
const INPUT: Record<Variant, string> = {
  site: `${INPUT_BASE} bg-bone border border-rule`,
  splash: `${INPUT_BASE} bg-bone-2 border-2 border-ink`,
};

function Contribute() {
  const { data } = useSiteSettings();
  const { isWriter, loading } = useAuth();
  // Readers arriving while the site is in maintenance only ever see the splash,
  // so this page wears the splash look instead of the full site chrome.
  const splash = !!data?.maintenanceMode && (loading || !isWriter);
  return splash ? <SplashShell /> : <SiteShell />;
}

function Intro({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <p>
        cdreviews. has run on contributors since 1995. If you write about music and have clips to
        prove it, we want to read them.
      </p>
      <p>
        Send two or three links to work you've published — reviews, essays, interviews — and a
        line or two about what you listen to. If it's a fit, an editor will write back.
      </p>
    </div>
  );
}

function SiteShell() {
  return (
    <div className="bg-bone text-ink min-h-screen">
      <SiteHeader />
      <PageHead num="§ 11" title="Write for us." dek="We're always reading. Send the desk your best published work." />
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <Intro className="fr-excerpt text-[17px] sm:text-[18px] text-ink-2" />
        <ApplicationForm variant="site" />
      </section>
      <AdSlot placement="home_break" className="pb-16" />
      <SiteFooter />
    </div>
  );
}

function SplashShell() {
  return (
    <main className="bg-bone text-ink min-h-screen flex flex-col">
      <div className="max-w-[1100px] w-full mx-auto px-6 pt-10 flex justify-between font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
        <span>Independent music criticism</span>
        <span>Est. 1995</span>
      </div>
      <section className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-12 md:py-16 flex flex-col justify-center">
        <Link to="/" aria-label="cdreviews — home" className="flex items-end gap-4 w-fit">
          <span className="fr-display-bold text-[clamp(48px,10vw,140px)] leading-none whitespace-nowrap" aria-hidden="true">
            cdreviews<span className="text-vermil">.</span>
          </span>
          <span className="cd-disc spin flex-none mb-2 w-[clamp(36px,7vw,100px)] h-[clamp(36px,7vw,100px)]" aria-hidden="true" />
        </Link>
        <div className="mt-10 border-t-2 border-ink pt-8 grid md:grid-cols-2 gap-10">
          <div>
            <div className="font-mono text-[12px] tracking-[0.12em] uppercase text-vermil">Side B · Write for us</div>
            <h1 className="fr-display text-[40px] md:text-[56px] mt-3">
              Pitch the <span className="serif-it">desk.</span>
            </h1>
            <Intro className="mt-4 text-[17px] text-ink-2 max-w-[48ch]" />
          </div>
          <ApplicationForm variant="splash" />
        </div>
      </section>
      <div className="max-w-[1100px] w-full mx-auto px-6 pb-8 flex flex-wrap gap-4 justify-between font-mono text-[11px] tracking-[0.12em] uppercase text-mute">
        <span>© 1995 — 2026 cdreviews</span>
        <span className="flex gap-6">
          <Link to="/" className="hover:text-vermil">← Back</Link>
          <Link to="/auth" className="hover:text-vermil">Staff sign in</Link>
        </span>
      </div>
    </main>
  );
}

function ApplicationForm({ variant }: { variant: Variant }) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const splash = variant === "splash";
  const input = INPUT[variant];
  const box = splash ? "border-2 border-ink bg-bone p-5 sm:p-7" : "border border-rule p-5 sm:p-8 bg-bone-warm";

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
    const values = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      samples: String(fd.get("samples") ?? ""),
      note: String(fd.get("note") ?? ""),
    };
    const fieldErrors = applicationErrors(values);
    if (fieldErrors) {
      setErrors(fieldErrors);
      setFormError(null);
      const first = FIELD_ORDER.find((f) => fieldErrors[f]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const data = applicationSchema.parse(values);
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

  if (status === "ok") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className={`${box} space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-vermil self-start`}
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
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={status === "sending"}
      className={`relative space-y-5 ${box}`}
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
          onChange={() => clearError("name")} className={input}
        />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input
          id="email" name="email" type="email" inputMode="email" autoComplete="email"
          autoCapitalize="off" spellCheck={false} maxLength={APPLICATION_LIMITS.email}
          aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined}
          onChange={() => clearError("email")} className={input}
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
          onChange={() => clearError("samples")} className={input}
        />
      </Field>
      <Field id="note" label="Anything else (optional)" error={errors.note}>
        <textarea
          id="note" name="note" rows={3} maxLength={APPLICATION_LIMITS.note}
          aria-invalid={!!errors.note} aria-describedby={errors.note ? "note-error" : undefined}
          onChange={() => clearError("note")} className={input}
        />
      </Field>
      <button
        type="submit"
        disabled={status === "sending"}
        className={
          splash
            ? "w-full sm:w-auto h-14 px-7 bg-vermil text-night font-bold text-[16px] hover:opacity-90 disabled:opacity-60"
            : "w-full sm:w-auto min-h-12 font-mono text-[12px] sm:text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 hover:bg-ink hover:text-bone disabled:opacity-50"
        }
      >
        {status === "sending" ? "Sending…" : "Send to the desk →"}
      </button>
      <p role="alert" className="font-mono text-[11px] tracking-[0.12em] uppercase text-vermil empty:hidden">
        {formError}
      </p>
    </form>
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
